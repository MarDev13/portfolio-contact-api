import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { CreateContactDto } from './dto/create-contact.dto/create-contact.dto';

@Injectable()
export class ContactService {
  private resend: Resend;
  private from: string;
  private to: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }

    this.resend = new Resend(apiKey);

    this.from = this.configService.get<string>('CONTACT_FROM') ?? '';
    this.to = this.configService.get<string>('CONTACT_TO') ?? '';

    if (!this.from) {
      throw new Error('CONTACT_FROM is not set');
    }

    if (!this.to) {
      throw new Error('CONTACT_TO is not set');
    }
  }

  async sendContactEmail(createContactDto: CreateContactDto) {
    const { name, email, message, number } = createContactDto;

    const lines = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      number ? `Número: ${number}` : null,
      '',
      'Mensaje:',
      message,
    ].filter(Boolean);

    const text = lines.join('\n');

    try {
      await this.resend.emails.send({
        from: this.from,
        to: this.to,
        subject: `Nuevo mensaje de ${name}`,
        text,
      });

      return { ok: true };
    } catch (error) {
      console.error('Error enviando email de contacto:', error);
      throw new InternalServerErrorException(
        'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.',
      );
    }
  }
}


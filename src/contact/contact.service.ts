import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from './dto/create-contact.dto/create-contact.dto';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendContactEmail(createContactDto: CreateContactDto) {
    const { name, email, message, number } = createContactDto;

    const lines = [
      `Nombre: ${name}`,
      `Email: ${email}\n`,
      number ? `Número: ${number}\n` : null,
    
    
      "Mensaje:",
      message,
    ].filter(Boolean);

    const text = lines.join('\n');

    try {
      await this.transporter.sendMail({
        from: `"Portfolio Web" <${this.configService.get<string>('SMTP_USER')}>`,
        to: this.configService.get<string>('CONTACT_TO'),
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


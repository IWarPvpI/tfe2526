import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class ConfirmDemandeDto {
  @ApiProperty({ example: 'Dupont SA' })
  @IsString()
  @IsNotEmpty()
  client: string;

  @ApiProperty({ 
    example: { 
       rue: 'Rue de la Loi', 
       numero: '16', 
       codePostal: '1000', 
       ville: 'Bruxelles', 
       pays: 'Belgique' 
    } 
  })
  @IsObject()
  origine: any;

  @ApiProperty({ 
    example: { 
       rue: 'Avenue des Arts', 
       numero: '1', 
       codePostal: '1000', 
       ville: 'Bruxelles', 
       pays: 'Belgique' 
    } 
  })
  @IsObject()
  destination: any;

  @ApiProperty({ example: '2026-06-10' })
  @IsString()
  date: string;

  @ApiProperty({ example: '2026-06-12' })
  @IsString()
  livraisonDate: string;

  @ApiProperty({ example: '2.5' })
  @IsString()
  poids: string;

  @ApiProperty({ 
    example: { 
      serviceType: 'INTERNATIONAL_PRIORITY', 
      serviceName: 'FedEx International Priority', 
      totalNetCharge: 45.50, 
      currency: 'EUR' 
    } 
  })
  @IsObject()
  selectedOption: any;
}

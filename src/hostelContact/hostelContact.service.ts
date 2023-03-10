import { InjectRepository } from '@nestjs/typeorm';
import Hostel from 'src/hostel/hostel.entity';
import { Repository } from 'typeorm';
import HostelContact from './hostelContact.entity';

class ContactService {
  constructor(
    @InjectRepository(HostelContact)
    private contactRepository: Repository<HostelContact>,
    @InjectRepository(Hostel)
    private hostelRepository: Repository<Hostel>,
  ) {}

  async create({ name, type, contact }, id: string) {
    try {
      const hostel = await this.hostelRepository.findOne({ where: { id } });
      if (!hostel) throw new Error('Invalid Hostel');

      let cont = this.contactRepository.create();
      cont.name = name;
      cont.type = type;
      cont.contact = contact;
      cont.hostel = hostel;
      return this.contactRepository.save(cont);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}

export default ContactService;

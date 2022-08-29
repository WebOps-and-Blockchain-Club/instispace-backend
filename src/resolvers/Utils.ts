import { messMenu, academicCallender } from "../utils/config.json";
import { Authorized, Query, Resolver } from "type-graphql";

@Resolver()
class UtilsResolver {
  @Query(() => [String])
  async getLocations() {
    return [
      "Main gate",
      "Overhead Water Tank",
      "Annam Temple",
      "Jalakanteshvar temple",
      "Vana-Vani HS school",
      "IITM Shopping centre",
      "IITM research park",
      "NCC office",
      "Kendriy Vidyalaya",
      "ICSR",
      "Vatsa Stadium",
      "OAT",
      "SAC",
      "Velacheri gate",
      "Taramani gate",
      "Hospital",
      "GC",
      "Library",
      "Nilgiri",
      "Himalaya",
      "Vindhya",
      "Usha",
      "CCD",
      "Food Court Ishthara",
      "Anjapar",
      "Prime Mart",
      "CLT",
      "CRC",
      "Ramanujan",
      "Raman",
      "NAC",
      "CSB",
      "SSB",
      "HSB",
      "ESB-1",
      "ESB-2",
      "Mandakini Hostel",
      "Jamuna Hostel",
      "Naramada Hostel",
      "Alaknanda Hostel",
      "Krishna Hostel",
      "Cauvery Hostel",
      "Tunga Hostel",
      "Bhadra Hostel",
      "Tapti Hostel",
      "Brahmputra Hostel",
      "Sarasvati Hostel",
      "Sharavathi Hostel",
      "Sarayu Hostel",
      "Sabarmati Hostel",
      "Pampa Hostel",
      "Ganga Hostel",
      "Godavari Hostel",
      "Tamraparani Hostel",
      "Sindhu Hostel",
      "Mahanadi Hostel",
      "CCW",
      "DOST office",
      "GATE office",
      "Administration block",
      "Jee office",
      "Chemplast",
      "Sport complex",
      "Swimming pool",
      "Department of Management",
      "Department of Ocean engg",
      "Department of ED",
      "Department of ME",
      "Department of CH",
      "Department of MM",
      "Department of BT",
      "Department of physics",
      "Department of Civil Eng",
      "Bonn Avenue",
      "Delhi Avenue",
    ];
  }

  @Query(() => String)
  @Authorized()
  async getMessMenu() {
    return messMenu;
  }

  @Query(() => String)
  @Authorized()
  async getAcademicCallender() {
    return academicCallender;
  }
}

export default UtilsResolver;

export interface BookingInterface {
    ID?: number;
    FacilityID?: number;
    MemberID?: number;
    Facility?: {               // Facility เป็น Optional Property
        ID?: number;           // ID ของ Facility
        FacilityName?: string; // ชื่อของ Facility
        TimeOpen?: string;     // เวลาเปิด
        TimeClose?: string;    // เวลาปิด
        Using?: number;        // จำนวนที่ใช้งานอยู่
        Capacity?: number;     // ความจุของ Facility
    };
}
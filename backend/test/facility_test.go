package uint

import (
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/ThanawitGZS/SE-Project/entity"
	"testing"
	"time"
)

func TestFacility(t *testing.T){
	g := NewGomegaWithT(t)

	var date time.Time

	facilityType := entity.FacilityType{
		Name: "ฟิตเนส",
	}

	facilityStatus := entity.FacilityStatus{
		Name: "เปิด",
	}

	employee := entity.Employee{
		FirstName: "Thanawit",
		LastName: "Yanangam",
		PhoneNumber: "0123456789",		
		NationalId: "1234567890123",
		Email: "Thanawit@stayease.com",
		Password: "12345",
		Profile: "longtext",
		GenderID: uint(1),
		PositionID: uint(1),
	}

	t.Run(`facility is valid`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())

	})

	t.Run(`facility_name is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "",//ผิดตรงนี้
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FacilityName is required"))

	})

	t.Run(`capacity is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 0,//ผิดตรงนี้
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Capacity is required"))

	})

	t.Run(`time_open is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "",//ผิดตรงนี้
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TimeOpen is required"))

	})

	t.Run(`time_close is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "",//ผิดตรงนี้
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TimeClose is required"))

	})

	t.Run(`descript is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "",//ผิดตรงนี้
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Descript is required"))

	})

	t.Run(`facility_type_id is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	date,//ผิดตรงนี้
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("DateCreate is required"))

	})

	t.Run(`facility_type_id is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(0),//ผิดตรงนี้
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FacilityTypeID is required"))

	})

	t.Run(`facility_status_id is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(0),//ผิดตรงนี้
			FacilityStatus: facilityStatus,
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FacilityStatusID is required"))

	})

	t.Run(`employee_id is required`, func(t *testing.T) {
		facility := entity.Facility{
			FacilityName: "GYM",
			Capacity: 50,
			TimeOpen: "05:00",
			TimeClose: "06:00",
			Descript: "ห้องออกกำลังกาย",
			DateCreate:	time.Now(),
			FacilityTypeID: uint(1),
			FacilityType: facilityType,
			FacilityStatusID: uint(1),
			FacilityStatus: facilityStatus,
			EmployeeID: uint(0),//ผิดตรงนี้
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(facility)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))

	})

}
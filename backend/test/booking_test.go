package uint

import (
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/ThanawitGZS/SE-Project/entity"
	"testing"
	"time"
)

func TestBooking(t *testing.T){
	g := NewGomegaWithT(t)

	employee := entity.Employee {
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

	member := entity.Member{
		FirstName: "Thanawit",
		LastName: "Yanangam",
		PhoneNumber: "0123456788",		
		NationalId: "1234567890121",
		Email: "ThanawitGZS@stayease.com",
		Password: "12345",
		Profile: "longtext",
		GenderID: uint(1),
		PositionID: uint(1),
		EmployeeID: uint(1),
		Employee: employee,
	}

	facilityType := entity.FacilityType{
		Name: "ฟิตเนส",
	}

	facilityStatus := entity.FacilityStatus{
		Name: "เปิด",
	}

	facility := entity.Facility{
		FacilityName: "GYM",
		Using:	1,
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

	t.Run(`booking is valid`, func(t *testing.T) {
		booking := entity.Booking{
			FacilityID: uint(1),
			Facility: facility,
			MemberID: uint(1),
			Member: member,
		}

		ok, err := govalidator.ValidateStruct(booking)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())

	})

	t.Run(`facility_id is required`, func(t *testing.T) {
		booking := entity.Booking{
			FacilityID: uint(0),//ผิดตรงนี้
			Facility: facility,
			MemberID: uint(1),
			Member: member,
		}

		ok, err := govalidator.ValidateStruct(booking)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FacilityID is required"))

	})

	t.Run(`member_id is required`, func(t *testing.T) {
		booking := entity.Booking{
			FacilityID: uint(1),
			Facility: facility,
			MemberID: uint(0),//ผิดจรงนี้
			Member: member,
		}

		ok, err := govalidator.ValidateStruct(booking)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("MemberID is required"))

	})

}
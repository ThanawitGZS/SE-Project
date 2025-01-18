package uint

import (
	"fmt"
	"testing"
	"time"

	"github.com/ThanawitGZS/SE-Project/entity"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestRoom(t *testing.T) {
	var date time.Time
	g := NewGomegaWithT(t)

	employee := entity.Employee{
			FirstName:"Thanawit",
			LastName:"Yanangam",
			PhoneNumber:"0123456789",		
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext",
			GenderID:uint(1),
			PositionID:uint(1),
	}

	t.Run(`room is valid`, func(t *testing.T) {
		room := entity.Room{
			RoomName:   "7101",
			RoomRent:   2900,
			RoomLimit:  2,
			DateCreate: time.Now(),
			RoomTypeID: uint(1),
			PetAllowID: uint(1),
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())

		fmt.Printf("Error ที่ได้รับ : %v", err)
	})

	t.Run(`room_name is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "", //ผิดตรงนี้
			RoomRent: 2900,
			RoomLimit: 2,
			DateCreate: time.Now(),
			RoomTypeID: uint(1),
			PetAllowID: uint(1),
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RoomName is required"))
	})

	t.Run(`room_rent is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101", 
			RoomRent: 0, //ผิดตรงนี้
			RoomLimit: 2,
			DateCreate: time.Now(),
			RoomTypeID: uint(1),
			PetAllowID: uint(1),
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RoomRent is required"))
	})

	t.Run(`room_limit is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101", 
			RoomRent: 2900,
			RoomLimit: 0, //ผิดตรงนี้
			DateCreate: time.Now(),
			RoomTypeID: 1,
			PetAllowID: 1,
			EmployeeID: 1,
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RoomLimit is required"))
	})

	t.Run(`date_create is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101", 
			RoomRent: 2900,
			RoomLimit: 3,
			DateCreate: date, //ผิดตรงนี้
			RoomTypeID: uint(1),
			PetAllowID: uint(1),
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("DateCreate is required"))
	})

	t.Run(`room_type_id is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101", 
			RoomRent: 2900,
			RoomLimit: 3,
			DateCreate: time.Now(), 
			RoomTypeID: uint(0), //ผิดตรงนี้
			PetAllowID: uint(1),
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RoomTypeID is required"))
	})

	t.Run(`pet_allow_id is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101", 
			RoomRent: 2900,
			RoomLimit: 3,
			DateCreate: time.Now(), 
			RoomTypeID: uint(1),
			PetAllowID: uint(0), //ผิดตรงนี้
			EmployeeID: uint(1),
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("PetAllowID is required"))
	})

	t.Run(`employee_id is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101", 
			RoomRent: 2900,
			RoomLimit: 3,
			DateCreate: time.Now(), 
			RoomTypeID: uint(1),
			PetAllowID: uint(1),
			EmployeeID: uint(0), //ผิดตรงนี้
			Employee: employee,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})

}

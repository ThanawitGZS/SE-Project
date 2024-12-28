package uint

import (
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/ThanawitGZS/SE-Project/entity"
	"testing"
	"time"
)

func TestRoom(t *testing.T){
	g := NewGomegaWithT(t)
	var date time.Time
	var rent uint
	var limit uint
	var id uint

	t.Run(`room is valid`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101",
			RoomRent: 2900,
			RoomLimit: 2,
			DateCreate: time.Now(),
			RoomTypeID: 1,
			PetAllowID: 1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run(`room_name is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "", //ผิดตรงนี้
			RoomRent: 2900,
			RoomLimit: 2,
			DateCreate: time.Now(),
			RoomTypeID: 1,
			PetAllowID: 1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RoomName is required"))
	})

	t.Run(`room_rent is required`, func(t *testing.T) {
		room := entity.Room{
			RoomName: "7101", 
			RoomRent: rent, //ผิดตรงนี้
			RoomLimit: 2,
			DateCreate: time.Now(),
			RoomTypeID: 1,
			PetAllowID: 1,
			EmployeeID: 1,
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
			RoomLimit: limit, //ผิดตรงนี้
			DateCreate: time.Now(),
			RoomTypeID: 1,
			PetAllowID: 1,
			EmployeeID: 1,
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
			RoomTypeID: 1,
			PetAllowID: 1,
			EmployeeID: 1,
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
			RoomTypeID: id, //ผิดตรงนี้
			PetAllowID: 1, 
			EmployeeID: 1,
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
			RoomTypeID: 1,
			PetAllowID: id, //ผิดตรงนี้
			EmployeeID: 1,
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
			RoomTypeID: 1,
			PetAllowID: 1,
			EmployeeID: id, //ผิดตรงนี้
		}

		ok, err := govalidator.ValidateStruct(room)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}
package uint

import (
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/ThanawitGZS/SE-Project/entity"
	"testing"
)

func TestMember(t *testing.T){
	g := NewGomegaWithT(t)
	var id uint

	t.Run(`member is valid`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yanangam",
			PhoneNumber:"0123456789",		
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext",
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run(`first_name is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"", //ผิดตรงนี้
			LastName:"Yanangam",
			PhoneNumber:"0123456789",		
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext",
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FirstName is required"))
	})

	t.Run(`last_name is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"", //ผิดตรงนี้
			PhoneNumber:"0123456789",		
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext",
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("LastName is required"))
	})

	t.Run(`phone_number is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"", //ผิดตรงนี้	
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext",
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("PhoneNumber is required"))
	})

	t.Run(`national_id is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"0123456789",
			NationalId:"", //ผิดตรงนี้	
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext",
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("NationalId is required"))
	})

	t.Run(`email is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"0123456789",
			NationalId:"1234567890123",
			Email:"Thanawit.com", //ผิดตรงนี้	
			Password:"12345",
			Profile:"longtext",
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Email is invalid"))
	})

	t.Run(`password is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"0123456789",
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"", //ผิดตรงนี้
			Profile:"longtext",
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Password is required"))
	})

	t.Run(`profile is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"0123456789",
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"", //ผิดตรงนี้
			EmployeeID:1,
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Profile is required"))
	})

	t.Run(`employee_id is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"0123456789",
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext", 
			EmployeeID:id, //ผิดตรงนี้
			GenderID:1,
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})

	t.Run(`gender_id is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"0123456789",
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext", 
			EmployeeID:1,
			GenderID:id, //ผิดตรงนี้
			PositionID:1,
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("GenderID is required"))
	})

	t.Run(`position_id is required`, func(t *testing.T) {
		member := entity.Member{
			FirstName:"Thanawit",
			LastName:"Yangngam",
			PhoneNumber:"0123456789",
			NationalId:"1234567890123",
			Email:"Thanawit@stayease.com",
			Password:"12345",
			Profile:"longtext", 
			EmployeeID:1,
			GenderID:1,
			PositionID:id, //ผิดตรงนี้
		}

		ok, err := govalidator.ValidateStruct(member)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("PositionID is required"))
	})
	
}
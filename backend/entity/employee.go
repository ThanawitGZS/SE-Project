package entity

import (
	"gorm.io/gorm"
)

type Employee struct {
	gorm.Model
	FirstName string `valid:"required~FirstName is required"`
	LastName  string `valid:"required~LastName is required"`
	PhoneNumber		string `valid:"required~PhoneNumber is required"`
	NationalId string `valid:"required~NationalId is required"`
	Email     string `valid:"required~Email is required, email~Email is invalid"`
	Password  string `valid:"required~Password is required"`
	Profile   string `gorm:"type:longtext" valid:"required~Profile is required"`

	// FK from Gender
	GenderID uint 		`valid:"required~GenderID is required"`
	Gender   Gender 	`gorm:"foreignKey: gender_id"`
	// FK from Position
	PositionID uint 	`valid:"required~PositionID is required"`
	Position   Position `gorm:"foreignKey: position_id"`

	Members			[]Member	`gorm:"foreignKey: employee_id"`
	Room			[]Room	`gorm:"foreignKey: employee_id"`
}

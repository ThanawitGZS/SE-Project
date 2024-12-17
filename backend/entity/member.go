package entity

import(
	"gorm.io/gorm"
) 

type Member struct{
	gorm.Model
	FirstName string
	LastName  string
	PhoneNumber		string //`gorm:"unique"`
	NationalId string //`gorm:"unique"`
	Email     string
	Password  string
	Profile   string `gorm:"type:longtext"`

	// FK from Employee
	EmployeeID		uint		
	Employee		Employee	`gorm:"foreignKey: employee_id"`
	// FK from Gender
	GenderID		uint
	Gender			Gender 		`gorm:"foreignKey: gender_id"`
	// FK from Position
	PositionID uint
	Position   Position `gorm:"foreignKey: position_id"`
}
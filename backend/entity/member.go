package entity

import(
	"gorm.io/gorm"
) 

type Member struct{
	gorm.Model
	FirstName		string			
	LastName		string			
	PhoneNumber		string      `gorm:"unique"`
	Point 			int	

	// FK from Employee
	EmployeeID		uint		
	Employee		Employee	`gorm:"foreignKey: employee_id"`
	// FK from Gender
	GenderID		uint
	Gender			Gender 		`gorm:"foreignKey: gender_id"`
}
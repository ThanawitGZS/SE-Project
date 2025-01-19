package entity

import (
	"gorm.io/gorm"
	"time"
)

type Facility struct {
	gorm.Model
	FacilityName string 	`valid:"required~FacilityName is required"`
	Using		uint 		`valid:"required~Using is required"`
	Capacity 	uint		`valid:"required~Capacity is required"`
	TimeOpen 	string 	`valid:"required~TimeOpen is required"`
	TimeClose 	string 	`valid:"required~TimeClose is required"`
	Descript 	string		`valid:"required~Descript is required"`
	DateCreate time.Time `valid:"required~DateCreate is required"`

	FacilityTypeID 	uint			`valid:"required~FacilityTypeID is required"`
	FacilityType	FacilityType 	`gorm:"foreignKey: facility_type_id"`

	FacilityStatusID 	uint			`valid:"required~FacilityStatusID is required"`
	FacilityStatus		FacilityStatus	`gorm:"foreignKey: facility_status_id"`

	EmployeeID		uint			`valid:"required~EmployeeID is required"`
	Employee		Employee		`gorm:"foreignKey: employee_id"`
}
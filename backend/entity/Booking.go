package entity

import (
	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model

	FacilityID 	uint		`valid:"required~FacilityID is required"`
	Facility	Facility 	`gorm:"foreignKey: facility_id"`

	MemberID 	uint		`valid:"required~MemberID is required"`
	Member		Member		`gorm:"foreignKey: member_id"`
}
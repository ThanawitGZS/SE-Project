package entity

import (
	"gorm.io/gorm"
)

type FacilityType struct {
	gorm.Model
	Name string

	Facility []Facility `gorm:"foreignKey:facility_type_id"`
}
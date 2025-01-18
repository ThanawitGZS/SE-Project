package entity

import (
	"gorm.io/gorm"
)

type FacilityStatus struct {
	gorm.Model
	Name string

	Facility []Facility `gorm:"foreignKey:facility_status_id"`
}
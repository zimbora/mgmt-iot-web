-- Migration: add variant_id to firmwares table
-- Fixes: Unknown column 'variant_id' in 'field list' when uploading firmware
-- The firmwares table was missing the variant_id foreign key column

ALTER TABLE `firmwares`
  ADD COLUMN `variant_id` INT NULL DEFAULT NULL AFTER `model_id`,
  ADD CONSTRAINT `fk_firmwares_variant_id`
    FOREIGN KEY (`variant_id`) REFERENCES `variants` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

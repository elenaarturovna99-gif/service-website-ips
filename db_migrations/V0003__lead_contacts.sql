ALTER TABLE t_p50541790_service_website_ips.leads ADD COLUMN email VARCHAR(200) NULL;
ALTER TABLE t_p50541790_service_website_ips.leads ADD COLUMN company VARCHAR(300) NULL;
ALTER TABLE t_p50541790_service_website_ips.leads ADD COLUMN inn VARCHAR(20) NULL;
ALTER TABLE t_p50541790_service_website_ips.leads ADD COLUMN client_email_sent BOOLEAN NOT NULL DEFAULT FALSE;
export interface PolicyScanResult {
    _embedded: {
        findings: Finding[];
    };
}

export interface CWE {
    id: number;
    name?: string;
    href?: string;
}

export interface FindingCategory {
    id: number;
    name: string;
    href: string;
}

export interface FindingDetails {
    severity?: number;
    cwe?: CWE;
    file_path: string;
    file_name: string;
    module?: string;
    relative_location?: number;
    finding_category?: FindingCategory;
    procedure?: string;
    exploitability?: number;
    attack_vector?: string;
    file_line_number: number;
}

export interface FindingStatus {
    first_found_date: string;
    status: string;
    resolution: string;
    mitigation_review_status: string;
    new: boolean;
    resolution_status: string;
    last_seen_date: string;
}

export interface Finding {
    issue_id?: number;
    scan_type?: string;
    description?: string;
    count?: number;
    context_type?: string;
    context_guid?: string;
    violates_policy?: boolean;
    finding_status?: FindingStatus;
    finding_details: FindingDetails;
    build_id?: number;
    flaw_match: PolicyFlawFingerprint
}

export interface Links {
    self: {
        href: string;
        templated?: boolean;
    };
    application: {
        href: string;
    };
    sca: {
        href: string;
        templated?: boolean;
    };
}

export interface PolicyFlawMatch {
    context_guid: string
    file_path: string
    procedure: string
}

export interface SarifFingerprint {
    sarif_fingerprint: string
}

export type PolicyFlawFingerprint = SarifFingerprint | PolicyFlawMatch
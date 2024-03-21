export interface PipelineScanResult {
    _links?: Links
    scan_id?: string
    scan_status?: string
    message?: string
    findings: Issue[]
    pipeline_scan?: string
    dev_stage?: string
}

export interface Links {
    root: Root
    self: Self
    help: Help
}

export interface Root {
    href: string
}

export interface Self {
    href: string
}

export interface Help {
    href: string
}

export interface Issue {
    title: string
    issue_id?: number
    gob?: string
    severity: number 
    issue_type_id?: string
    issue_type?: string
    cwe_id: string
    display_text: string
    files: Files
    flaw_match: FlawFingerprint
}

export interface Files {
    source_file: SourceFile
}

export interface SourceFile {
    file: string
    line: number
    function_name: string
    qualified_function_name: string
    function_prototype?: string
    scope?: string
}

export interface FlawMatch {
    procedure_hash: string
    prototype_hash: string
    flaw_hash: string
    flaw_hash_count: number
    flaw_hash_ordinal: number
    cause_hash: string
    cause_hash_count: number
    cause_hash_ordinal: number

}

export interface SarifFingerprint {
    sarif_fingerprint: string
}

export type FlawFingerprint = SarifFingerprint | FlawMatch
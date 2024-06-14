export interface ResponseData {
    next_page: string | null;
    results: Result[];
  }
  
 export interface Result {
    last_updated: string;
    linkedin_profile_url: string;
    profile: Profile;
  }
  
 export interface FormState {
    company: string;
    country: string;
    state: string;
    city: string;
    first_name: string;
    last_name: string;
    education_field_of_study: string;
    education_degree_name: string;
    education_school_name: string;
    education_school_linkedin_profile_url: string;
    current_role_title: string;
    past_role_title: string;
    current_role_before: string;
    current_role_after: string;
    current_company_linkedin_profile_url: string;
    past_company_linkedin_profile_url: string;
    current_job_description: string;
    past_job_description: string;
    current_company_name: string;
    past_company_name: string;
    linkedin_groups: string;
    languages: string;
    region: string;
    headline: string;
    summary: string;
    industries: string;
    interests: string;
    skills: string;
    current_company_country: string;
    current_company_region: string;
    current_company_city: string;
    current_company_type: string;
    current_company_follower_count_min: string;
    current_company_follower_count_max: string;
    current_company_industry: string;
    current_company_employee_count_min: string;
    current_company_employee_count_max: string;
    current_company_description: string;
    current_company_founded_after_year: string;
    current_company_founded_before_year: string;
    current_company_funding_amount_min: string;
    current_company_funding_amount_max: string;
    current_company_funding_raised_after: string;
    current_company_funding_raised_before: string;
    public_identifier_in_list: string;
    public_identifier_not_in_list: string;
    enrich: boolean;
    page_size: number;
    enrich_profiles: 'skip' | 'enrich';
  }
  
 export interface Profile {
    id?: number;
    public_identifier?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    country_full_name?: string | null;
    summary?: string | null;
    profile_pic_url?: string | null;
    background_cover_image_url?: string | null;
    headline?: string | null;
    occupation?: string | null;
    connections?: number | null;
    follower_count?: number | null;
    experiences?: Experience[];
    educations?: Education[];
    accomplishment_courses?: Course[];
    accomplishment_honors_awards?: HonourAward[];
    accomplishment_organisations?: AccomplishmentOrg[];
    accomplishment_patents?: Patent[];
    accomplishment_projects?: Project[];
    accomplishment_publications?: Publication[];
    accomplishment_test_scores?: TestScore[];
    activities?: Activity[];
    articles?: Article[];
    certifications?: Certification[];
    groups?: Group[];
    languages?: Language[];
    people_also_viewed?: PeopleAlsoViewed[];
    recommendations?: string[] | null;
    similarly_named_profiles?: SimilarProfile[];
    skills?: string[] | null;
    volunteer_work?: VolunteerWork[];
  }
  
 export interface Experience {
    id?: number;
    profile_id?: number;
    company: string;
    title?: string | null;
    description?: string | null;
    location?: string | null;
    starts_at?: Date | null;
    ends_at?: Date | null;
    company_linkedin_profile_url?: string | null;
    logo_url?: string | null;
    profile?: Profile;
  }
  
 export interface Education {
    id?: number;
    profile_id?: number;
    school?: string;
    degree_name?: string;
    field_of_study?: string | null;
    starts_at?: Date | null;
    ends_at?: Date | null;
    description?: string | null;
    activities_and_societies?: string | null;
    grade?: string | null;
    logo_url?: string | null;
    school_linkedin_profile_url?: string | null;
    profile?: Profile;
  }
  
 export interface Course {
    id?: number;
    profile_id?: number;
    name?: string | null;
    number?: string | null;
    profile?: Profile;
  }
  
 export interface HonourAward {
    id?: number;
    profile_id?: number;
    title?: string | null;
    issuer?: string | null;
    issuedOn?: Date | null;
    description?: string | null;
    profile?: Profile;
  }
  
 export interface AccomplishmentOrg {
    id?: number;
    profile_id?: number;
    org_name?: string | null;
    title?: string | null;
    description?: string | null;
    starts_at?: Date | null;
    ends_at?: Date | null;
    profile?: Profile;
  }
  
 export interface Patent {
    id?: number;
    profile_id?: number;
    title?: string | null;
    issuer?: string | null;
    issuedOn?: Date | null;
    description?: string | null;
    application_number?: string | null;
    patent_number?: string | null;
    url?: string | null;
    profile?: Profile;
  }
  
 export interface Project {
    id?: number;
    profile_id?: number;
    title?: string | null;
    description?: string | null;
    url?: string | null;
    starts_at?: Date | null;
    ends_at?: Date | null;
    profile?: Profile;
  }
  
 export interface Publication {
    id?: number;
    profile_id?: number;
    name?: string | null;
    publisher?: string | null;
    published_on?: Date | null;
    description?: string | null;
    url?: string | null;
    profile?: Profile;
  }
  
 export interface TestScore {
    id?: number;
    profile_id?: number;
    name?: string | null;
    score?: string | null;
    date_on?: Date | null;
    description?: string | null;
    profile?: Profile;
  }
  
export interface Activity {
    id?: number;
    profile_id?: number;
    activity_status?: string | null;
    link?: string | null;
    title?: string | null;
    profile?: Profile;
  }
  
 export interface Article {
    id?: number;
    profile_id?: number;
    title?: string | null;
    link?: string | null;
    published_date?: Date | null;
    author?: string | null;
    image_url?: string | null;
    profile?: Profile;
  }
  
 export interface Certification {
    id?: number;
    profile_id?: number;
    authority?: string | null;
    display_source?: string | null;
    ends_at?: Date | null;
    license_number?: string | null;
    name?: string | null;
    starts_at?: Date | null;
    url?: string | null;
    profile?: Profile;
  }
  
 export interface Group {
    id?: number;
    profile_id?: number;
    profile_pic_url?: string | null;
    name?: string | null;
    url?: string | null;
    profile?: Profile;
  }
  
 export interface VolunteerWork {
    id?: number;
    profile_id?: number;
    cause?: string | null;
    company?: string | null;
    company_linkedin_profile_url?: string | null;
    description?: string | null;
    ends_at?: Date | null;
    logo_url?: string | null;
    starts_at?: Date | null;
    title?: string | null;
    profile?: Profile;
  }
  
 export interface PeopleAlsoViewed {
    id?: number;
    profile_id?: number;
    link?: string | null;
    name?: string | null;
    summary?: string | null;
    location?: string | null;
    profile?: Profile;
  }
  
 export interface SimilarProfile {
    id?: number;
    profile_id?: number;
    name?: string | null;
    link?: string | null;
    summary?: string | null;
    location?: string | null;
    profile?: Profile;
  }
  
 export interface Language {
    id?: number;
    profile_id?: number;
    language?: string | null;
    profile?: Profile;
  }
  
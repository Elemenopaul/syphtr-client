import React from 'react';

type Product = {
    categories: Record<string, number>;
};

type SapProductsType = Record<string, Product>;

export const sapProducts: SapProductsType = {
    "s/4hana": { categories: { ERP: 100,} },
    "businessone": { categories: { ERP: 100 } },
    "by design": { categories: { ERP: 100 } },
    "erp": { categories: { ERP: 100 } },
    "businessobjects": { categories: { BI: 100 } },
    "data services": { categories: { DataQuality: 100 } },
    "crystal reports": { categories: { BI: 100 } },
    "fiori": { categories: { CMS: 10, ECM: 10 } },
    "ariba": { categories: { ProcurementSoftware: 100 } },
    "successfactors": { categories: { HRM: 100 } },
    "concur": { categories: { ProcurementSoftware: 100, DMS: 10 } },
    "hana": { categories: { Databases: 100, BI: 100 } },
    "leonardo": { categories: { IoT: 100, AI: 100 } },
    "hybris": { categories: { Ecommerce: 100 } },
    "fieldglass": { categories: { ProcurementSoftware: 10, DMS: 10 } },
    "litmos": { categories: { LMS: 100 } },
    "fioneer": { categories: { Fintech: 100 } },
    "customer experience": { categories: { CustomerExperience: 100 } },
    "cx": { categories: { CustomerExperience: 100 } },
    "procurement": { categories: { ProcurementSoftware: 100 } },
    "intelligent spend": { categories: { ProcurementSoftware: 100 } },
    "rise": { categories: { ERP: 100, Migration: 100 } },
    "signavio": { categories: { BusinessProcessManagement: 100 } },
    "database": { categories: { Databases: 100 } },
    "billing and innovation": { categories: { Fintech: 100 } },
    "billing and revenue": { categories: { Fintech: 100 } },
    // ... rest of the SAP products
};

type OracleProductsType = Record<string, Product>;

export const oracleProducts: OracleProductsType = {
    "Database": { categories: { Databases: 100 } },
    "ERP": { categories: { ERP: 100 } },
    "NetSuite": { categories: { ERP: 100 } },
    "E-Business Suite": { categories: { ERP: 100 } },
    "crm": { categories: { CRM: 100 } },
    "cx": { categories: { CustomerExperience: 100 } },
    "hyperion": { categories: { BI: 100, DataAnalytics: 100 } },
    "hcm": { categories: { HRM: 100 } },
    "hrm": { categories: { HRM: 100 } },
    "Oracle SCM Cloud": { categories: { SCM: 100 } },
    "analytics": { categories: { BI: 100, DataAnalytics: 100 } },
    "data quality": { categories: { DataQuality: 100 } },
    // Add more products as needed
};


type MicrosoftProductsType = Record<string, Product>;

export const microsoftProducts: MicrosoftProductsType = {
    "dynamics 365": { categories: { CRM: 100, ERP: 100 } },
    "power bi": { categories: { BI: 100, DataVisualization: 100 } },
    "powerapps": { categories: { DataIntegration: 100, Integration: 100 } },
    "azure": { categories: { CloudComputing: 100 } },
};

type IBMProductsType = Record<string, Product>;

export const ibmProducts: IBMProductsType = {
  "ibm cloud": { categories: { CloudComputing: 100 } },
  "watson": { categories: { AI: 100, DataScience: 100 } },
  "maximo": { categories: { EAM: 100 } },
  "sterling": { categories: { SCM: 100 } },
  "curam": { categories: { CRM: 100 } },
  "tealeaf": { categories: { DataAnalytics: 100, DataVisualization: 100 } },
  "cognos": { categories: { BI: 100, DataAnalytics: 100, DataVisualization: 100 } },
  "spss": { categories: { DataScience: 100, DataAnalytics: 100 } },
  "i2": { categories: { DataAnalytics: 100, DataVisualization: 100 } },
  "unica": { categories: { MarketingAutomation: 100 } },
  "guardium": { categories: { DataSecurity: 100 } },
  "appscan": { categories: { DataSecurity: 100 } },
  "bigfix": { categories: { DataSecurity: 100 } },
  "resilient": { categories: { DataSecurity: 100 } },
  "qradar": { categories: { DataSecurity: 100 } },
  "trusteer": { categories: { DataSecurity: 100 } },
  "maas360": { categories: { DataSecurity: 100 } },
  "tivoli": { categories: { ITManagement: 100 } },  // Adjusted category
  "rational": { categories: { SoftwareDevelopmentTools: 100 } },  // Adjusted category
  "websphere": { categories: { Middleware: 100 } },  // Adjusted category
  "db2": { categories: { Databases: 100 } },
  "informix": { categories: { Databases: 100 } },
  "datastage": { categories: { DataIntegration: 100 } },
  "infosphere": { categories: { DataIntegration: 100 } },
  "cognos analytics": { categories: { BI: 100, DataAnalytics: 100, DataVisualization: 100 } },
  };

const ProductInfo: React.FC = () => {
  return (
    <div>
      <h1>Product Information</h1>
      {/* Render your product information here */}
    </div>
  );
};

export default ProductInfo;
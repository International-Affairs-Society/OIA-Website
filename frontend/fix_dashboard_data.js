const fs = require('fs');
const file = 'src/app/admin/page.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Remove MOCK imports
c = c.replace(/import \{\s*UNIVERSITY_COORDS,\s*MOCK_MOUS[\s\S]*?MOCK_PROGRAM_STATUS_SUMMARY,\s*\} from "\.\/data\/mockData";/m, 'import { UNIVERSITY_COORDS } from "./data/mockData";');

// 2. Add overviewData state
if (!c.includes('const [overviewData, setOverviewData]')) {
  c = c.replace(/const \[programsList, setProgramsList\] = useState<any\[\]>\(\[\]\);/, 
    `const [programsList, setProgramsList] = useState<any[]>([]);\n  const [overviewData, setOverviewData] = useState<any>({});`);
}

// 3. Update fetchData to include analytics overview
if (!c.includes('/analytics/overview')) {
  c = c.replace(
    /const \[mousRes, appsRes, progsRes\] = await Promise\.all\(\[/,
    `const [mousRes, appsRes, progsRes, overviewRes] = await Promise.all([\n          apiFetch(\`/api/v1/analytics/overview\`),`
  );
  c = c.replace(
    /if \(mousRes\.ok\)/,
    `if (overviewRes && overviewRes.ok) {\n          const res = await overviewRes.json();\n          setOverviewData(res);\n        }\n        if (mousRes.ok)`
  );
}

// 4. Replace MOCK_ references with the dynamic useMemo equivalents in the JSX
const replacements = {
  'MOCK_TREND_DATA': 'appTrendData',
  'MOCK_STATUS_DATA': 'appStatusData',
  'MOCK_SCHOOL_DATA': 'schoolCounts',
  'MOCK_MOU_YEAR_DATA': 'mouYearData',
  'MOCK_MOU_TYPE_DATA': 'mouTypeData',
  'MOCK_APP_PROGRAM_BREAKDOWN': 'appProgramBreakdown',
  'MOCK_APP_SEMESTER_DATA': 'appSemesterData',
  'MOCK_APP_GENDER_DATA': 'appGenderData',
  'MOCK_PROGRAM_TYPE_DATA': 'programTypeData',
  'MOCK_PROGRAM_YEAR_DATA': 'programYearData',
  'MOCK_PROGRAM_SCHOOL_COVERAGE': 'programSchoolCoverage',
  'MOCK_PROGRAM_STATUS_SUMMARY': 'programStatusSummary'
};

for (const [mock, real] of Object.entries(replacements)) {
  const regex = new RegExp(mock, 'g');
  c = c.replace(regex, real);
}

fs.writeFileSync(file, c);
console.log("Replaced mock data usages.");

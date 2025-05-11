/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from "csv-parse";
import { parse as parseSync } from "csv-parse/sync";
import path from "path";
import fs from "fs";
import sanitizeHtml from "sanitize-html";
// name splitter
export const forbiddenCourseCode = ["2301399", "2301499"];
export const forbiddenClassType = ["2301399", "2301499"];
export function nameSplitter(name: string): Name {
  const nameObject: Name = {
    honorific: undefined,
    firstName: undefined,
    lastName: undefined,
  };
  // split name by space
  const nameArray = name.trim().split(" ");
  // length == 3 means there is a honorific
  if (nameArray.length === 3) {
    nameObject.honorific = nameArray[0];
    nameObject.firstName = nameArray[1];
    nameObject.lastName = nameArray[2];
  } else if (nameArray.length === 2) {
    nameObject.firstName = nameArray[0];
    nameObject.lastName = nameArray[1];
  } else {
    throw new Error("Invalid name format");
  }
  return nameObject;
}

export type Name = {
  honorific: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
};

export function splitThaiHonorific(name: string): Name {
  const thaiHonorifics = [
    "พล.อ.อ.ร.",
    "พล.อ.อ.ต.",
    "พล.อ.ร.ต.",
    "พล.ร.ต.",
    "พล.อ.ร.",
    "พล.อ.ท.",
    "พล.ต.ต.",
    "พล.ต.ท.",
    "พล.ร.อ.",
    "พล.อ.อ.",
    "พล.ต.อ.",
    "พล.อ.",
    "พล.ต.",
    "ผศ.",
    "รศ.",
    "ศ.",
    "ดร.",
    "น.ส.",
    "นางสาว",
    "นาง",
    "นาย",
  ];

  const nameObject: Name = {
    honorific: undefined,
    firstName: undefined,
    lastName: undefined,
  };

  // Forcefully split the name by matching honorifics
  for (const honorific of thaiHonorifics) {
    if (name.startsWith(honorific)) {
      nameObject.honorific = honorific;
      const remainingName = name.slice(honorific.length).trim();
      const nameArray = remainingName.split(" ");
      nameObject.firstName = nameArray[0];
      nameObject.lastName = nameArray.slice(1).join(" ");
      //console.log(nameObject);
      return nameObject;
    }
  }

  // If no honorific is found, split normally
  const nameArray = name.trim().split(" ");
  if (nameArray.length < 2) {
    throw new Error("Invalid name format");
  }

  nameObject.firstName = nameArray[0];
  nameObject.lastName = nameArray.slice(1).join(" ");

  return nameObject;
}

export type JSON = { [k: string]: string };

export function parseCSVintoObject(
  csvData: string[],
  expected_column: number,
  expected_table_name: string,
) {
  const lines = csvData.map((line) => line.trim());
  const foundTableName = lines[0].split(",")[0].trim().replaceAll('"', "");

  if (lines.length === 0 || foundTableName !== expected_table_name) {
    throw new Error(
      `First cell does not match the expected table name. Found "${foundTableName}". Expected "${expected_table_name}"`,
    );
  }
  let commastring = "";
  for (let i = 0; i < expected_column - 1; i++) commastring += ",";
  const result: string[] = [];
  let foundCommaString = false;

  for (const line of lines) {
    if (foundCommaString) {
      result.push(line);
    } else if (line === commastring) {
      foundCommaString = true;
    }
  }
  const arrayOfNoBlanks = result.filter((line) => line.trim() !== "");
  const preppedForParsing = arrayOfNoBlanks.join("\n");
  //console.log(preppedForParsing);
  const records = parse(preppedForParsing, {
    columns: true,
  });
  return records;
}

export function getFirstColumnCleaned(data: string[]) {
  const lines = data.map((line) => line.trim());
  return lines[0].split(",").map((v) => v.trim());
}

export function parseCSVintoObjectSync(
  csvData: string[],
  expected_column: number | null,
  expected_table_name: string,
  firstColumnCheck = function (firstColumn: any) {
    return true;
  },
) {
  const lines = csvData.map((line) => line.trim());
  const foundTableName = lines[0].split(",")[0].trim().replace('"', "");

  if (lines.length === 0 || foundTableName !== expected_table_name) {
    throw new Error(
      `First cell does not match the expected table name. Found "${foundTableName}". Expected "${expected_table_name}"`,
    );
  }
  if (!firstColumnCheck(lines[0].split(",").map((v) => v.trim()))) {
    throw new Error(`File does not match condition specified."`);
  }
  let commastring = "";
  const columns = expected_column ?? lines[0].split(",").length;
  for (let i = 0; i < columns - 1; i++) commastring += ",";
  const result: string[] = [];
  let foundCommaString = false;

  for (const line of lines) {
    if (foundCommaString) {
      result.push(line);
    } else if (line === commastring) {
      foundCommaString = true;
    }
  }
  const arrayOfNoBlanks = result.filter((line) => line.trim() !== "");
  const preppedForParsing = arrayOfNoBlanks.join("\n");
  const records = parseSync(preppedForParsing, {
    columns: true,
  });
  return records;
}

export function parseCSVintoObjectNoChecks(csvData: string[]) {
  const arrayOfNoBlanks = csvData
    .filter((line) => line.trim() !== "")
    .map((l) => l.trim());
  const preppedForParsing = arrayOfNoBlanks.join("\n");
  const records = parseSync(preppedForParsing, {
    columns: true,
  });
  return records;
}

export function NUNU(strin: any) {
  if (strin === null || strin === undefined) return null;
  return strin === "NULL" || strin.toString().trim() == "" ? null : strin;
}

export function nuller(strin: any) {
  return strin === undefined || strin === null ? null! : NUNU(strin);
}

export function scramNAN(input: any) {
  if (isNaN(input)) {
    return null;
  }
  return input;
}

export function getCurriculum(majorCode: number, program: number) {
  let level = -1;
  if (program == 0 || program == 9) level = 9;
  else if (program >= 1 && program <= 4) level = 1;
  else if (program == 5 || program == 6) level = 3;
  else if (program == 7 || program == 8) level = 6;
  if (level == -1) throw Error(`Invalid Program : ${program}`);
  if (level == 1) {
    if (majorCode == 23011) level++;
    else if (majorCode != 23010)
      throw Error(`Invalid Major Code : ${majorCode} for Program ${program}`);
  } else if (level == 3) {
    if (majorCode == 23014) level++;
    else if (majorCode == 23015) level += 2;
    else if (majorCode != 23010)
      throw Error(`Invalid Major Code : ${majorCode} for Program ${program}`);
  } else if (level == 6) {
    if (majorCode == 23014) level++;
    else if (majorCode == 23015) level += 2;
    else if (majorCode != 23010)
      throw Error(`Invalid Major Code : ${majorCode} for Program ${program}`);
  }
  return level;
}

export function curriculumToString(curriculum: number): string {
  switch (curriculum) {
    case 1:
      return "B.Sc.Math";
    case 2:
      return "B.Sc.CS";
    case 3:
      return "M.Sc.MATH";
    case 4:
      return "M.Sc.CSIT";
    case 5:
      return "M.Sc.AMCS";
    case 6:
      return "Ph.D.MATH";
    case 7:
      return "Ph.D.CSIT";
    case 8:
      return "Ph.D.AMCS";
    case 9:
      return "Others";
    default:
      throw new Error(`Invalid curriculum number: '${curriculum}'`);
  }
}
export function curriculumNumberFromString(curriculum: string): number {
  const trimmedCurriculum = curriculum.replace(/\s+/g, "");
  switch (trimmedCurriculum.toLowerCase()) {
    case "B.Sc.Math".toLowerCase():
      return 1;
    case "B.Sc.CS".toLowerCase():
      return 2;
    case "M.Sc.MATH".toLowerCase():
      return 3;
    case "M.Sc.CSIT".toLowerCase():
      return 4;
    case "M.Sc.AMCS".toLowerCase():
      return 5;
    case "Ph.D.MATH".toLowerCase():
      return 6;
    case "Ph.D.CSIT".toLowerCase():
      return 7;
    case "Ph.D.AMCS".toLowerCase():
      return 8;
    default:
      return 9;
  }
}

// 1:ก1, 2:ก2, 3:ข, 4:1.1, 5:1.2, 6:2.1, 7:2.2
export function planToString(plan: number): string {
  switch (plan) {
    case 1:
      return "ก.1";
    case 2:
      return "ก.2";
    case 3:
      return "ข";
    case 4:
      return "1.1";
    case 5:
      return "1.2";
    case 6:
      return "2.1";
    case 7:
      return "2.2";
    default:
      throw new Error(`Invalid plan number: '${plan}'`);
  }
}

export function planNumberFromString(plan: string): number {
  const trimmedPlan = plan.replace(/\s+/g, "");
  switch (trimmedPlan) {
    case "ก.1":
      return 1;
    case "ก.2":
      return 2;
    case "ข":
      return 3;
    case "1.1":
      return 4;
    case "1.2":
      return 5;
    case "2.1":
      return 6;
    case "2.2":
      return 7;
    default:
      throw new Error(`Invalid plan string: '${plan}'`);
  }
}
// 1:ปกติ 2:จบการศึกษา 3:พ้นสภาพ 4:รักษาสภาพ 5:ลาพัก
export function statusToString(status: number): string {
  switch (status) {
    case 1:
      return "ปกติ";
    case 2:
      return "จบการศึกษา";
    case 3:
      return "พ้นสภาพ";
    case 4:
      return "รักษาสภาพ";
    case 5:
      return "ลาพัก";
    default:
      throw new Error(`Invalid status number: '${status}'`);
  }
}

export function statusNumberFromString(status?: string): number | undefined {
  if (!status) return undefined;
  const trimmedStatus = status.replace(/\s+/g, "");
  switch (trimmedStatus) {
    case "ปกติ":
      return 1;
    case "จบการศึกษา":
      return 2;
    case "พ้นสภาพ":
      return 3;
    case "รักษาสภาพ":
      return 4;
    case "ลาพัก":
      return 5;
    default:
      return 1;
    //throw new Error(`Invalid status string: '${status}'`);
  }
}
// 1: Advisor/Co-advisor, 2: Proposal Committee, 3: Thesis Committee, 4: General advisor, 5: Indiv advisor
export function roleToString(role: number): string {
  switch (role) {
    case 1:
      return "advisor";
    case 2:
      return "co_advisor";
    case 3:
      return "examiner";
    default:
      throw new Error(`Invalid role number: '${role}'`);
  }
}

export function roleNumberFromString(role: string): number {
  const trimmedRole = role.replace(/\s+/g, "");
  switch (trimmedRole) {
    case "advisor":
      return 1;
    case "co_advisor":
      return 2;
    case "examiner":
      return 3;
    default:
      throw new Error(`Invalid role string: '${role}'`);
  }
}

export function maxTermFromString(role: string, plan: number): number {
  const trimmedRole = role.replace(/\s+/g, "");
  switch (trimmedRole) {
    case "advisior":
      return 1;
      break;
    case "co_advisor":
      return 2;
      break;
    case "examiner":
      return 1;
      break;
    default:
      throw new Error(`Invalid role string: '${role}'`);
  }
}

export function courseIdToString(plan: number, curriculum: number): string {
  if (curriculum == 3 || curriculum == 5) {
    switch (plan) {
      case 1:
        return "2301817";
      case 2:
        return "2301813";
      default:
        throw new Error(`Invalid plan number: '${plan}'`);
    }
  } else if (curriculum == 6 || curriculum == 8) {
    switch (plan) {
      case 4:
        return "2301829";
      case 5:
        return "2301829"; //real one is 2301830
      case 6:
        return "2301828";
      case 7:
        return "2301828";
      default:
        throw new Error(`Invalid plan number: '${plan}'`);
    }
  } else if (curriculum == 4) {
    switch (plan) {
      case 1:
        return "2301816";
      case 2:
        return "2301811";
      default:
        throw new Error(`Invalid plan number: '${plan}'`);
    }
  } else if (curriculum == 7) {
    switch (plan) {
      case 4:
        return "2301828";
      case 7:
        return "2301828";
      default:
        throw new Error(`Invalid plan number: '${plan}'`);
    }
  } else {
    throw new Error(
      `Invalid plan or curriculum number: '${plan}','${curriculum}'`,
    );
  }
}

export function readCSV(
  fileName: string,
  tableName: string,
  expected_column: number,
) {
  const filePath = path.join(global.appRoot, "../data/", `${fileName}.csv`);
  if (fs.existsSync(filePath)) {
    const fileDat = fs.readFileSync(filePath, "utf8").split("\n");
    const parsed = parseCSVintoObjectSync(fileDat, expected_column, tableName);
    return parsed;
  }
  return null;
}

export function readCSVNoChecks(fileName: string, folder: string = "data") {
  const filePath = path.join(
    global.appRoot,
    `../${folder}/`,
    `${fileName}.csv`,
  );
  if (fs.existsSync(filePath)) {
    const fileDat = fs.readFileSync(filePath, "utf8").split("\n");
    const parsed = parseCSVintoObjectNoChecks(fileDat);
    return parsed;
  }
  return null;
}

export const uniqueActivities = (activities: JSON[], keysToCheck: string[]) => {
  return activities.filter((value, index, self) => {
    return (
      index ===
      self.findIndex((t) => {
        return keysToCheck.every((key) => t[key] === value[key]);
      })
    );
  });
};

export const activityDataFromType = function (
  indata: JSON,
  type: string,
): JSON {
  const data: JSON = {};
  data["startDate"] = NUNU(indata["วันที่เริ่ม"]);
  data["endDate"] = NUNU(indata["วันที่สิ้นสุด"]);
  data["facultyName"] = indata["ชื่อ-สกุล"];
  data["role"] = indata["ตำแหน่ง"];
  data["level"] = indata["ระดับ (ภาควิชา/คณะ/มหาวิทยาลัย)"];
  data["cred"] = indata["จำนวน ชม."];
  switch (type) {
    case "culture":
    case "develop":
      data["name"] = indata["โครงการ"];
      break;
    case "management":
      data["name"] = indata["บริหาร/คณะกรรมการ"];
      break;
    case "services":
      data["name"] = indata["งาน/คณะกรรมการ"];
      data["internationality"] =
        "" +
        ((x: string) => {
          return x === "ระดับชาติ" ? 0 : 1;
        })(indata["ระดับชาติ / ระดับนานาชาติ"]);
      data["client"] = indata["ผู้รับบริการ"];
      data["budget"] = indata["งบประมาณ"];
      break;
  }
  return data;
};

export const DAYS = ["DAY1", "DAY2", "DAY3", "DAY4", "DAY5", "DAY6", "DAY7"];

export const activityNumberFromString = function (type: string) {
  switch (type) {
    case "develop":
      return 1;
    case "services":
      return 2;
    case "management":
      return 3;
    case "culture":
      return 4;
    default:
      return null;
  }
};

export const activityStringFromNumber = function (number: number) {
  switch (number) {
    case 1:
      return "develop";
    case 2:
      return "services";
    case 3:
      return "management";
    case 4:
      return "culture";
    default:
      return null;
  }
};

export function san(stringIn: string) {
  if (stringIn === null || stringIn == undefined) return null;
  const s = stringIn.replaceAll(/&nbsp;/g, "");
  return sanitizeHtml(s, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export const getScopusAuthorId = function (entry: any) {
  let resAuthorId = "";
  for (let j = 0; j < entry.author.length; j++) {
    resAuthorId += entry.author[j]["authid"];
  }
  return resAuthorId;
};

export const getScopusAuthors = function (entry: any) {
  let resAuthor = "";
  for (let j = 0; j < entry.author.length; j++) {
    resAuthor +=
      entry.author[j]["given-name"] + " " + entry.author[j]["surname"];
    if (j == entry.author.length - 2) {
      resAuthor += " and ";
      continue;
    }
    resAuthor = j == entry.author.length - 1 ? resAuthor : resAuthor + ", ";
  }
  return resAuthor;
};

export const getScopusInterCoop = function (entry: any) {
  let resAff = false;
  for (let a = 0; a < entry.affiliation.length; a++) {
    if (entry.affiliation[a]["affiliation-country"] != "Thailand") {
      resAff = true;
      break;
    }
  }
  return resAff;
};

export const getPosition = function (pos: number, status: string) {
  if (status == "solo") {
    return 1;
  } else if (status == "last") {
    return 4;
  } else if (pos === 1) {
    return 2;
  } else {
    return 3;
  }
};

export const pubTierFromString = function (tier: string) {
  switch (tier) {
    case "Q1":
      return 1;
    case "Q2":
      return 2;
    case "Q3":
      return 3;
    case "Q4":
      return 4;
    default:
      break;
  }
};

export function FRCS(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

// if null then null else

export function IFNULL(nullCheck: any, ifNotNull: any) {
  return nullCheck?.[ifNotNull] ?? null;
}

export function passSemester(year: number, term: number) {
  if (term == 2) {
    term = 1;
    year++;
  } else {
    term = 2;
  }
  const result = [year, term];
  return result;
}

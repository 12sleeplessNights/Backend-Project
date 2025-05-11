import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ELSEVIER_API_KEY = process.env.SCOPUS_API_KEY || null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ELSEVIER_AFFILIATION_ID = process.env.AFFILIATION_ID || null;

const ELSEVIER_API_ENDPOINT = "https://api.elsevier.com/";
const ELSEVIER_API_SCOPUS_SEARCH =
  ELSEVIER_API_ENDPOINT + "content/search/scopus";
const ELSEVIER_API_AUTHOR_SEARCH =
  ELSEVIER_API_ENDPOINT + "content/search/author";

// we do not have access to this right now
export async function authorSearch(lastName: string, firstName: string) {
  if (!ELSEVIER_API_KEY) {
    throw new Error("API KEY MISSING");
  }
  const res = await axios.get(ELSEVIER_API_AUTHOR_SEARCH, {
    params: {
      apiKey: ELSEVIER_API_KEY,
      query: `AUTHLASTNAME(${lastName}) AND AUTHFIRST(${firstName})`,
    },
  });
  if (res.status === 200) {
    return res.data;
  } else {
    throw new Error(`Error fetching author data: ${res.statusText}`);
  }
}

export async function getAllPapers(
  scopusId: string,
  year: number,
): Promise<ScopusSearchResults> {
  if (!ELSEVIER_API_KEY) {
    throw new Error("API KEY MISSING");
  }
  const res = await axios.get(ELSEVIER_API_SCOPUS_SEARCH, {
    params: {
      apiKey: ELSEVIER_API_KEY,
      query: `AU-ID(${scopusId}) AND PUBYEAR > ${year}`,
    },
  });
  if (res.status === 200) {
    return res.data;
  } else {
    throw new Error(`Error fetching author data: ${res.statusText}`);
  }
}

type ScopusSearchResults = {
  "search-results": {
    "opensearch:totalResults": string;
    "opensearch:startIndex": string;
    "opensearch:itemsPerPage": string;
    "opensearch:Query": {
      "@role": string;
      "@searchTerms": string;
      "@startPage": string;
    };
    link: Array<{
      "@_fa": string;
      "@ref": string;
      "@href": string;
      "@type": string;
    }>;
    entry: Array<{
      "@_fa": "true";
      link: Array<{
        "@_fa": string;
        "@ref": string;
        "@href": string;
      }>;
      "prism:url": string;
      "dc:identifier": string;
      eid: string;
      "dc:title": string;
      "dc:creator": string;
      "prism:publicationName": string;
      "prism:issn": string;
      "prism:eIssn": string;
      "prism:volume": string;
      "prism:pageRange": string | null;
      "prism:coverDate": string;
      "prism:coverDisplayDate": string;
      "prism:doi": string;
      pii: string;
      "citedby-count": string;
      affiliation: Array<{
        "@_fa": string;
        affilname: string;
        "affiliation-city": string;
        "affiliation-country": string;
      }>;
      "pubmed-id": string;
      "prism:aggregationType": string;
      subtype: string;
      subtypeDescription: string;
      "article-number": string;
      "source-id": string;
      openaccess: string;
      openaccessFlag: boolean;
    }>;
  };
};

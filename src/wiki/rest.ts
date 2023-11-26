// REST API Revision: https://www.mediawiki.org/w/index.php?title=API:REST_API/Reference&oldid=6201623
// https://en.wikipedia.org/api/rest_v1/
import { requestJSON } from "./utils";

type ContentModel = "wikitext" | "css" | "javascript" | "json" | "text";

interface Options {
  [key: string]: any;
}

/**
 * The search result object represents a wiki page matching the requested search.
 * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Search_result_object
 */
export interface SearchResult {
  /** Page identifier */
  id: number;
  /** Page title in URL-friendly format */
  key: string;
  /** Page title in reading-friendly format */
  title: string;
  /**
   * A few lines giving a sample of page content with search terms
   * highlighted with `<span class=\"searchmatch\">` tags.
   * For autocomplete page title endpoint: Page title in
   * reading-friendly format
   */
  excerpt: string;
  /**
   * The title of the page redirected from, if the search term
   * originally matched a redirect page or null if search term
   * did not match a redirect page.
   */
  matched_title?: string;
  /**
   * In Wikimedia projects: Short summary of the page topic based
   * on the corresponding entry on Wikidata or null if no entry exists.
   * See [[Extension:ShortDescription]] to populate this field in
   * third-party installations
   */
  description: string | null;
  /**
   * Information about the thumbnail image for the page or null if no thumbnail exists.
   */
  thumbnail: {
    /** Thumbnail media type */
    mimetype: string;
    /** File size in bytes or `null` if not available */
    size: number | null;
    /** Maximum recommended image width in pixels or `null` if not available */
    width: number | null;
    /** Maximum recommended image height in pixels or `null` if not available */
    height: number | null;
    /** Length of the video, audio, or multimedia file or `null` for other media types */
    duration: number | null;
    /** URL to download the file */
    url: string;
  } | null;
}

/**
 * The page object represents the latest revision of a wiki page.
 * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Page_object
 */
export interface Page {
  /** Page identifier */
  id: number;
  /** Page title in URL-friendly format */
  key: string;
  /** Page title in reading-friendly format */
  title: string;
  /** Information about the latest revision */
  latest: {
    /** Revision identifier for the latest revision */
    id: number;
    /** Timestamp of the latest revision in ISO 8601 format */
    timestamp: string;
  };
  /**
   * Type of content on the page. See the content handlers reference for
   * content models supported by MediaWiki and extensions.
   */
  content_model: ContentModel;
  /** Information about the wiki’s license, including: */
  license: {
    /** URL of the applicable license based on the $wgRightsUrl setting */
    url: string;
    /** Name of the applicable license based on the $wgRightsText setting */
    title: string;
  };
}

/**
 * The page language object represents a wiki page and its language.
 * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Page_language_object
 */
export interface PageLanguage {
  /**
   * Language code. For Wikimedia projects, see the site matrix on Meta-Wiki.
   * @example "pl"
   */
  code: string;
  /**
   * Translated language name.
   * @example "polski"
   */
  name: string;
  /** Translated page title in URL-friendly format */
  key: string;
  /** Translated page title in reading-friendly format */
  title: string;
}

export interface PreviewFormat {
  /** The file type */
  mediatype:
    | "BITMAP"
    | "DRAWING"
    | "AUDIO"
    | "VIDEO"
    | "MULTIMEDIA"
    | "UNKNOWN"
    | "OFFICE"
    | "TEXT"
    | "EXECUTABLE"
    | "ARCHIVE"
    | "3D";
  /** File size in bytes or `null` if not available */
  size: number | null;
  /** Maximum recommended image width in pixels or `null` if not available */
  width: number | null;
  /** Maximum recommended image height in pixels or `null` if not available */
  height: number | null;
  /**
   * The length of the video, audio, or multimedia file or null for other
   * media types
   */
  duration: number | null;
  /** URL to download the file */
  url: string;
}

/**
 * The file object represents a file uploaded to a wiki.
 * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#File_object
 */
export interface File {
  /** File title */
  title: string;
  /**
   * URL for the page describing the file, including license information and
   * other metadata
   */
  file_description_url: string;
  /** Object containing information about the latest revision to the file */
  latest: {
    /** Last modified timestamp in ISO 8601 format format */
    timestamp: string;
    /** Object containing information about the user who uploaded the file */
    user: {
      /** User identifier */
      id: number;
      /** Username */
      name: string;
    };
  };
  /** Information about the file’s preferred preview format. */
  preferred: PreviewFormat;
  /** Information about the file’s original format. */
  original: PreviewFormat;
  /** Information about the file’s thumbnail format. */
  thumbnail: PreviewFormat;
}

/**
 * The revision object represents a change to a wiki page.
 * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Revision_object
 */
export interface Revision {
  /** Revision identifier */
  id: number;
  /** Object containing information about the user that made the edit */
  user: {
    /** Username, can be an IP address */
    name: string;
    /** User identifier, can be `null` for anonymous users */
    id: number | null;
  };
  /** Time of the edit in ISO 8601 format */
  timestamp: string;
  /**
   * Comment or edit summary written by the editor. For revisions
   * without a comment, the API returns `null` or `""`.
   */
  comment: string | null;
  /** Size of the revision in bytes */
  size: number;
  /**
   * Number of bytes changed, positive or negative, between a revision and
   * the preceding revision (example: -20). If the preceding revision is
   * unavailable, the API returns null.
   */
  delta: number | null;
  /** Set to true for edits marked as minor */
  minor: boolean;
}

export interface PageHistorySegment {
  /** API route to get the latest revisions */
  latest: string;
  /** If available, API route to get the prior revisions */
  older?: string;
  /** If available, API route to get the following revisions */
  newer?: string;
  /** Array of 0-20 revision objects */
  revisions: Revision[];
}

export class RestAPI {
  constructor(private readonly host: string) {}

  /**
   * Searches wiki page titles and contents for the provided search terms, and returns
   * matching pages.
   * @param q Search terms
   * @param limit Maximum number of search results to return between 1 and 100. Default 50
   * @returns `pages` object containing array of search results
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Search_pages
   */
  search(q: string, limit?: number) {
    return this.get<{ pages: SearchResult[] }>("search/page", { q, limit });
  }

  /**
   * Searches wiki page titles, and returns matches between the beginning of a
   * title and the provided search terms. You can use this endpoint for a
   * typeahead search that automatically suggests relevant pages by title.
   * @param q Search terms
   * @param limit Maximum number of search results to return between 1 and 100. Default 50
   * @returns `pages` object containing array of search results
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Autocomplete_page_title
   */
  autocompleteTitle(q: string, limit?: number) {
    return this.get<{ pages: SearchResult[] }>("search/title", { q, limit });
  }

  /**
   * Creates a wiki page. The response includes a location header containing the
   * API endpoint to fetch the new page.
   *
   * This endpoint is designed to be used with the OAuth extension authorization
   * process. Callers using cookie-based authentication instead must add a CSRF
   * token to the request body. To get a CSRF token, see the Action API.
   * @returns Page object with `source` property
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Create_page
   */
  createPage(options: {
    /**
     * Page content in the format specified by the content_model property
     */
    source: string;
    /**
     * Page title. See the manual for information about page titles in MediaWiki.
     */
    title: string;
    /**
     * Reason for creating the page. To allow the comment to be filled in by the server,
     * use "comment": `null`.
     */
    comment: string | null;
    /**
     * Type of content on the page. Defaults to wikitext. See the content handlers
     * reference for content models supported by MediaWiki and extensions.
     */
    content_model: ContentModel;
    /**
     * CSRF token required when using cookie-based authentication. Omit this property when
     * authorizing using OAuth.
     */
    token?: string;
  }) {
    return this.post<Page>("page", options);
  }

  /**
   * Updates or creates a wiki page. This endpoint is designed to be used with
   * the [OAuth extension](https://www.mediawiki.org/wiki/OAuth/For_Developers)
   * authorization process. Callers using cookie-based authentication instead
   * must add a CSRF `token` to the request body. To get a CSRF token, see the
   * Action API.
   *
   * To update a page, you need the page’s latest revision ID and the page source.
   * First call the get page source endpoint, and then use the source and latest.id
   * to update the page. If latest.id doesn’t match the page’s latest revision,
   * the API resolves conflicts automatically when possible. In the event of an
   * edit conflict, the API returns a 409 error.
   *
   * To create a page, omit `latest.id` from the request.
   * @param title Wiki page title
   * @returns	Page object with `source` property
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Update_page
   */
  upsertPage(
    title: string,
    options: {
      /** Page content in the format specified by the content_model property */
      source: string;
      /**
       * Summary of the edit. To allow the comment to be filled in by the server,
       * use "comment": null.
       */
      comment: string | null;
      /**
       * Object identifying the base revision of the edit. You can fetch this
       * information from the get page source endpoint.
       */
      latest?: {
        /**
         * Identifier for the revision used as the base for the new source,
         * required for updating an existing page. To create a page, omit this
         * property.
         */
        id?: number;
      };
      /**
       * Type of content on the page. Defaults to `wikitext` for new pages or to
       * the existing page’s content model. See the content handlers reference for
       * content models supported by MediaWiki and extensions.
       */
      content_model?: ContentModel;
      /**
       * CSRF token required when using cookie-based authentication. Omit this
       * property when authorizing using OAuth.
       */
      token?: string;
    }
  ) {
    return this.post<
      Page & {
        /** Latest page content in the format specified by the `content_model` property */
        source: string;
      }
    >(`page/${en(title)}`, options);
  }

  /**
   * Returns the standard page object for a wiki page, including the API route
   * to fetch the latest content in HTML, the license, and information about
   * the latest revision.
   * @param title Wiki page title
   * @returns Page object with `html_url` property
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_page
   */
  getPage(title: string) {
    return this.get<
      Page & {
        /** API route to fetch the content of the page in HTML */
        html_url: string;
      }
    >(`page/${en(title)}/bare`);
  }

  /**
   * Returns information about a wiki page, including the license, latest revision, and
   * latest content in HTML.
   * @param title Wiki page title
   * @returns	Page object with `html` property
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_page_offline
   */
  getPageOffline(title: string) {
    return this.get<
      Page & {
        /** Latest page content in HTML, following the HTML 2.1.0 specification */
        html: string;
      }
    >(`page/${en(title)}/with_html`);
  }

  /**
   * Returns the content of a wiki page in the format specified by the
   * `content_model` property, the license, and information about the latest
   * revision.
   * @param title Wiki page title
   * @returns	Page object with `source` property
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_page_source
   */
  getPageSource(title: string) {
    return this.get<
      Page & {
        /** Latest page content in the format specified by the content_model property */
        source: string;
      }
    >(`page/${en(title)}`);
  }

  /**
   * Returns the latest content of a wiki page in HTML.
   * @param title Wiki page title
   * @returns Page HTML in HTML 2.1.0 format
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_HTML
   */
  async getHTML(title: string): Promise<string> {
    return text(fetch(this.getRestAPI(`page/${en(title)}/html`), { method: "GET" }));
  }

  /**
   * Searches connected wikis for pages with the same topic in different languages.
   * Returns an array of page language objects that include the name of the language,
   * the language code, and the translated page title.
   * @param title Wiki page title
   * @returns Array of page languages
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_languages
   */
  getLanguages(title: string) {
    return this.get<PageLanguage[]>(`page/${en(title)}/links/language`);
  }

  /**
   * Returns information about media files used on a wiki page.
   * @param title Wiki page title
   * @returns `files` object containing array of files
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_files_on_page
   */
  getFilesOnPage(title: string) {
    return this.get<{ files: File[] }>(`page/${en(title)}/links/media`);
  }

  /**
   * Returns information about a file, including links to download the file in
   * thumbnail, preview, and original formats.
   * @param title Wiki page title
   * @returns File
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_file
   */
  getFile(title: string) {
    return this.get<File>(`file/${en(title)}`);
  }

  /**
   * Converts wikitext to HTML.
   * @param title Wiki page title, used for context
   * @param payload Transform request body with source
   * @returns An HTML document.
   */
  transformWikiTextToHTML(title: string, payload: { wikitext: string }) {
    return this.post<string>(`transform/wikitext/to/html/${en(title)}`, payload);
  }

  /**
   * Returns information about the latest revisions to a wiki page, in segments of 20
   * revisions, starting with the latest revision. The response includes API routes for
   * the next oldest, next newest, and latest revision segments, letting you scroll
   * through page history.
   *
   * @param title Wiki page title
   * @returns Page history segment
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_page_history
   */
  getPageHistory(
    title: string,
    options: {
      /** Accepts a revision ID. Returns the next 20 revisions older than the given revision ID. */
      older_than?: number;
      /** Accepts a revision ID. Returns the next 20 revisions newer than the given revision ID. */
      newer_than?: number;
      /**
       * Filter that returns only revisions with certain tags, one of:
       * * `reverted`: Returns only revisions that revert an earlier edit
       * * `anonymous`: Returns only revisions made by anonymous users
       * * `bot`: Returns only revisions made by bots
       * * `minor`: Returns only minor revisions
       * The API supports one filter per request.
       */
      tag?: "reverted" | "anonymous" | "bot" | "minor";
    }
  ) {
    return this.get<PageHistorySegment>(`page/${en(title)}/history`, options);
  }

  async *getPageHistories(
    title: string,
    options: Parameters<RestAPI["getPageHistory"]>[1]
  ) {
    let segment = await this.getPageHistory(title, options);
    yield segment;
    while (segment.older) {
      segment = await this.get<PageHistorySegment>(segment.older);
      yield segment;
    }
  }

  /**
   * Returns data about a page’s history.
   * @param title Wiki page title
   * @returns
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_page_history_counts
   */
  // $ curl "https://en.wikipedia.org/w/rest.php/v1/page/Jupiter/history/counts/edits?from=384955912&to=406217369"
  getPageHistoryCounts(
    title: string,
    {
      range,
      ...options
    }: {
      /**
       * Type of count, one of:
       * * `anonymous`: Edits made by anonymous users. Limit: 10,000
       * * `bot`: Edits made by bots. Limit: 10,000
       * * `editors`: Users or bots that have edited a page. Limit: 25,000
       * * `edits`: Any change to page content. Limit: 30,000
       * * `minor`: Edits marked as minor. If the minor edit count exceeds 2,000,
       *    the API returns a 500 error. Limit: 1,000
       * * `reverted`: Edits that revert an earlier edit. Limit: 30,000
       */
      type: "anonymous" | "bot" | "editors" | "edits" | "minor" | "reverted";
      /**
       * For `edits` and `editors` types only.
       * Restricts the count to between two revisions, specified by revision ID.
       * The result excludes the edits or editors represented by the from and to revisions.
       */
      range?: {
        from: number;
        to: number;
      };
    }
  ) {
    return this.get<{
      /**
       * The value of the data point up to the type’s limit. If the value exceeds the
       * limit, the API returns the limit as the value of count and sets the limit
       * property to true.
       */
      count: number;

      /**
       * Returns true if the data point exceeds the type’s limit.
       */
      limit: boolean;
    }>(`page/${en(title)}/history/counts`, { ...options, ...range });
  }

  /**
   * Returns details for an individual revision.
   * @param id Revision ID
   * @returns Revision
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Get_revision
   */
  getRevision(id: number) {
    return this.get<Revision>(`revision/${id}`);
  }

  /**
   * Returns data that lets you display a line-by-line comparison of two revisions.
   * [(See an example.)](https://en.wikipedia.beta.wmflabs.org/w/index.php?diff=388864&oldid=388863&title=Main_Page&type=revision)
   * Only text-based wiki pages can be compared.
   * @param from Revision identifier to use as the base for comparison
   * @param to Revision identifier to compare to the base
   * @returns
   * @see https://www.mediawiki.org/wiki/API:REST_API/Reference#Compare_revisions
   */
  compareRevisions(from: number, to: number) {
    return this.get<{
      /** Information about the base revision used in the comparison */
      from: {
        /** Revision identifier */
        id: number;
        /** Area of the page being compared, usually `main` */
        slot_role: string;
      };
      /** Information about the revision being compared to the base revision */
      to: {
        /** Revision identifier */
        id: number;
        /** Area of the page being compared, usually `main` */
        slot_role: string;
      };
      /** Array of objects representing section headings */
      sections: {
        /** Heading level, 1 through 4 */
        level: number;
        /** Text of the heading line, in wikitext */
        heading: string;
        /** Location of the heading, in bytes from the beginning of the page */
        offset: number;
      }[];
      /**
       * Each object in the `diff` array represents a line in a visual, line-by-line
       * comparison between the two revisions.
       */
      diff: {
        /**
         * The type of change represented by the diff object, either:
         *
         * * `0`: A line with the same content in both revisions, included to provide
         *   context when viewing the diff. The API returns up to two context lines
         *   around each change.
         * * `1`: A line included in the to revision but not in the from revision.
         * * `2`: A line included in the from revision but not in the to revision.
         * * `3`: A line containing text that differs between the two revisions.
         *   (For changes to paragraph location as well as content, see type 5.)
         * * `4`: When a paragraph’s location differs between the two revisions, a type 4
         *   object represents the location in the from revision.
         * * `5`: When a paragraph’s location differs between the two revisions, a type 5
         *   object represents the location in the to revision. This type can also include
         *   word-level differences between the two revisions.
         */
        type: 0 | 1 | 2 | 3 | 4 | 5;
        /** The line number of the change based on the to revision. */
        lineNumber?: number;
        /**
         * The text of the line, including content from both revisions. For a line
         * containing text that differs between the two revisions, you can use
         * `highlightRanges` to visually indicate added and removed text. For a line
         * containing a new line, the API returns the text as `""` (empty string).
         */
        text: string;
        /**
         * An array of objects that indicate where and in what style text should be
         * highlighted to visually represent changes.
         */
        highlightRanges?: {
          /**
           * Where the highlighted text should start, in the number of bytes from the
           * beginning of the line.
           */
          start: number;
          /** The length of the highlighted section, in bytes. */
          length: number;
          /** The type of highlight. 0 indicates an addition, 1 indicates a deletion. */
          type: 0 | 1;
        }[];
        /**
         * Visual indicators to use when a paragraph’s location differs between the two
         * revisions. `moveInfo` objects occur in pairs within the diff.
         */
        moveInfo?: {
          /** The ID of the paragraph described by the diff object. */
          id: number;
          /**
           * The ID of the corresponding paragraph.
           * For type `4` diff objects, `linkId` represents the location in the to
           * revision.
           * For type `5` diff objects, `linkId` represents the location in the from
           * revision.
           */
          linkId: string;
          /**
           * A visual indicator of the relationship between the two locations. You can use
           * this property to display an arrow icon within the diff.
           * * `0` indicates that the linkId paragraph is lower on the page than the id
           *   paragraph.
           * * `1` indicates that the linkId paragraph is higher on the page than the id
           *   paragraph.
           */
          linkDirection: 0 | 1;
        };
        /**
         * The location of the line in bytes from the beginning of the page
         */
        offset: {
          /**
           * The first byte of the line in the `from` revision. A `null` value indicates
           * that the line doesn’t exist in the from revision.
           */
          from: number | null;
          /**
           * The first byte of the line in the `to` revision. A `null` value indicates
           * that the line doesn’t exist in the to revision.
           */
          to: number | null;
        };
      }[];
    }>(`revision/${from}/compare/${to}`);
  }

  private getRestAPI(path: string) {
    return `https://${this.host}/w/rest.php/v1/${path}`;
  }
  async get<T = unknown>(path: string, options?: Options) {
    return await requestJSON<T>(this.getRestAPI(path), "GET", options);
  }
  private async post<T = unknown>(path: string, options: Options) {
    return await requestJSON<T>(this.getRestAPI(path), "POST", options);
  }
}

const en = encodeURIComponent;
const text = (promise: Promise<Response>) => promise.then(res => res.text());

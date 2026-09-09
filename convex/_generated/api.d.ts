/* eslint-disable */
  /**
   * Generated `api` utility.
   *
   * THIS CODE IS AUTOMATICALLY GENERATED.
   *
   * To regenerate, run `npx convex dev`.
   * @module
   */

  import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
  import type * as actions_contact from "../actions/contact.js";
import type * as contact from "../contact.js";
import type * as lib_email_client from "../lib/email/client.js";
import type * as lib_email_components from "../lib/email/components.js";
import type * as lib_email_templates_contact from "../lib/email/templates/contact.js";
import type * as lib_email_utils_renderer from "../lib/email/utils/renderer.js";
import type * as lib_email_utils_subject from "../lib/email/utils/subject.js";

  /**
   * A utility for referencing Convex functions in your app's API.
   *
   * Usage:
   * ```js
   * const myFunctionReference = api.myModule.myFunction;
   * ```
   */
  declare const fullApi: ApiFromModules<{
    "actions/contact": typeof actions_contact,
"contact": typeof contact,
"lib/email/client": typeof lib_email_client,
"lib/email/components": typeof lib_email_components,
"lib/email/templates/contact": typeof lib_email_templates_contact,
"lib/email/utils/renderer": typeof lib_email_utils_renderer,
"lib/email/utils/subject": typeof lib_email_utils_subject,
  }>;
  export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
  export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;

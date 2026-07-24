/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as contact from "../contact.js";
import type * as contactActions from "../contactActions.js";
import type * as lib_email_client from "../lib/email/client.js";
import type * as lib_email_components from "../lib/email/components.js";
import type * as lib_email_templates_contact from "../lib/email/templates/contact.js";
import type * as lib_email_utils_createSubject from "../lib/email/utils/createSubject.js";
import type * as lib_email_utils_renderTemplate from "../lib/email/utils/renderTemplate.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  contact: typeof contact;
  contactActions: typeof contactActions;
  "lib/email/client": typeof lib_email_client;
  "lib/email/components": typeof lib_email_components;
  "lib/email/templates/contact": typeof lib_email_templates_contact;
  "lib/email/utils/createSubject": typeof lib_email_utils_createSubject;
  "lib/email/utils/renderTemplate": typeof lib_email_utils_renderTemplate;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

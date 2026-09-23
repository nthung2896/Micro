/*
 * $Id: base64.ts,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

import type { Base64Type } from "./types";

let Base64: Base64Type;

(function (global: any) {
  "use strict";

  const _Base64 = global.Base64;
  const version = "2.1.9";

  let buffer: any;
  if (typeof module !== "undefined" && module.exports) {
    try {
      buffer = require("buffer").Buffer;
    } catch (err) {}
  }

  const b64chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const b64tab = function (bin: string) {
    const t: Record<string, number> = {};
    for (let i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
    return t;
  }(b64chars);

  const fromCharCode = String.fromCharCode;

  // encoder stuff
  const cb_utob = function (c: string): string {
    if (c.length < 2) {
      const cc = c.charCodeAt(0);
      return cc < 0x80
        ? c
        : cc < 0x800
          ? fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f))
          : fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
            fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
            fromCharCode(0x80 | (cc & 0x3f));
    } else {
      const cc =
        0x10000 +
        (c.charCodeAt(0) - 0xd800) * 0x400 +
        (c.charCodeAt(1) - 0xdc00);
      return (
        fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) +
        fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) +
        fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
        fromCharCode(0x80 | (cc & 0x3f))
      );
    }
  };

  const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
  const utob = function (u: string): string {
    return u.replace(re_utob, cb_utob);
  };

  const cb_encode = function (ccc: string): string {
    const padlen = [0, 2, 1][ccc.length % 3];
    const ord =
      (ccc.charCodeAt(0) << 16) |
      ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
      (ccc.length > 2 ? ccc.charCodeAt(2) : 0);
    const chars = [
      b64chars.charAt(ord >>> 18),
      b64chars.charAt((ord >>> 12) & 63),
      padlen >= 2 ? "=" : b64chars.charAt((ord >>> 6) & 63),
      padlen >= 1 ? "=" : b64chars.charAt(ord & 63),
    ];
    return chars.join("");
  };

  const btoa = global.btoa
    ? function (b: string): string {
        return global.btoa(b);
      }
    : function (b: string): string {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
      };

  const _encode = buffer
    ? function (u: string): string {
        return (
          u.constructor === buffer.constructor
            ? u
            : new buffer(u)
        ).toString("base64");
      }
    : function (u: string): string {
        return btoa(utob(u));
      };

  const encode = function (u: string, urisafe?: boolean): string {
    return !urisafe
      ? _encode(String(u))
      : _encode(String(u))
          .replace(/[+\/]/g, function (m0: string) {
            return m0 === "+" ? "-" : "_";
          })
          .replace(/=/g, "");
  };

  const encodeURI = function (u: string): string {
    return encode(u, true);
  };

  // decoder stuff
  const re_btou = new RegExp(
    [
      "[\xC0-\xDF][\x80-\xBF]",
      "[\xE0-\xEF][\x80-\xBF]{2}",
      "[\xF0-\xF7][\x80-\xBF]{3}",
    ].join("|"),
    "g"
  );

  const cb_btou = function (cccc: string): string {
    switch (cccc.length) {
      case 4:
        const cp =
          ((0x07 & cccc.charCodeAt(0)) << 18) |
          ((0x3f & cccc.charCodeAt(1)) << 12) |
          ((0x3f & cccc.charCodeAt(2)) << 6) |
          (0x3f & cccc.charCodeAt(3));
        const offset = cp - 0x10000;
        return (
          fromCharCode((offset >>> 10) + 0xd800) +
          fromCharCode((offset & 0x3ff) + 0xdc00)
        );
      case 3:
        return fromCharCode(
          ((0x0f & cccc.charCodeAt(0)) << 12) |
            ((0x3f & cccc.charCodeAt(1)) << 6) |
            (0x3f & cccc.charCodeAt(2))
        );
      default:
        return fromCharCode(
          ((0x1f & cccc.charCodeAt(0)) << 6) |
            (0x3f & cccc.charCodeAt(1))
        );
    }
  };

  const btou = function (b: string): string {
    return b.replace(re_btou, cb_btou);
  };

  const cb_decode = function (cccc: string): string {
    const len = cccc.length;
    const padlen = len % 4;
    const n =
      (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) |
      (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) |
      (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) |
      (len > 3 ? b64tab[cccc.charAt(3)] : 0);
    const chars = [
      fromCharCode(n >>> 16),
      fromCharCode((n >>> 8) & 0xff),
      fromCharCode(n & 0xff),
    ];
    chars.length -= [0, 0, 2, 1][padlen];
    return chars.join("");
  };

  const atob = global.atob
    ? function (a: string): string {
        return global.atob(a);
      }
    : function (a: string): string {
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
      };

  const _decode = buffer
    ? function (a: string): string {
        return (
          a.constructor === buffer.constructor
            ? a
            : new buffer(a, "base64")
        ).toString();
      }
    : function (a: string): string {
        return btou(atob(a));
      };

  const decode = function (a: string): string {
    return _decode(
      String(a)
        .replace(/[-_]/g, function (m0: string) {
          return m0 === "-" ? "+" : "/";
        })
        .replace(/[^A-Za-z0-9\+\/]/g, "")
    );
  };

  const noConflict = function (): Base64Type {
    const Base64 = global.Base64;
    global.Base64 = _Base64;
    return Base64;
  };

  Base64 = {
    VERSION: version,
    atob: atob,
    btoa: btoa,
    fromBase64: decode,
    toBase64: encode,
    utob: utob,
    encode: encode,
    encodeURI: encodeURI,
    btou: btou,
    decode: decode,
    noConflict: noConflict,
  };

  if (typeof Object.defineProperty === "function") {
    const noEnum = function (v: any) {
      return {
        value: v,
        enumerable: false,
        writable: true,
        configurable: true,
      };
    };
    Base64.extendString = function () {
      Object.defineProperty(
        String.prototype,
        "fromBase64" as any,
        noEnum(function (this: string) {
          return decode(this);
        })
      );
      Object.defineProperty(
        String.prototype,
        "toBase64" as any,
        noEnum(function (this: string, urisafe?: boolean) {
          return encode(this, urisafe);
        })
      );
      Object.defineProperty(
        String.prototype,
        "toBase64URI" as any,
        noEnum(function (this: string) {
          return encode(this, true);
        })
      );
    };
  }

  if (global["Meteor"]) {
    global.Base64 = Base64;
  }

  global.Base64 = Base64;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this);

export { Base64 };

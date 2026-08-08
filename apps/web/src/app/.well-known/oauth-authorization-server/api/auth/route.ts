// RFC 8414の規則では、issuer（`{baseURL}/api/auth`）にパスが含まれる場合、
// メタデータURLは「ホストとパスの間」に.well-knownを挿入した
// `/.well-known/oauth-authorization-server/api/auth`になる（末尾に付ける
// `/.well-known/oauth-authorization-server`ではない）。claude.ai等の
// 仕様準拠クライアントはこちらを叩くため、同じハンドラをこの経路にも公開する。
export { GET } from "../../route";

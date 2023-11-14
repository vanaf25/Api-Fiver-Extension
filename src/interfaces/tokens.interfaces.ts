export interface TokensResponse {
  token:string
}
type TokenUserData = { id: string };
export interface TokenData {
  payload: TokenUserData
}
export interface RateLimitOptions {
  //--- seconds
  window: number;
  //--- max requests per window
  limit: number;
}

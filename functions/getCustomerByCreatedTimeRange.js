"use strict";

const moment = require("moment");

module.exports = async function(flowContext, payload) {
  let customers = [];
  let hasMore = false;
  const currentPage = payload.page;
  const currentPageIndex = currentPage - 1;
  const pageSize = payload.pageSize;

  console.log(moment(payload.createdDateRange.startDateGMT).unix());
  console.log(moment(payload.createdDateRange.endDateGMT).unix());

  let uri = `${this.baseUri}?target=RESTAPI&_key=${
    this.channelProfile.channelAuthValues.apiKey
  }&_schema=default&_path=profile&_cnd[added][0]=${moment(
    payload.createdDateRange.startDateGMT
  ).unix()}&_cnd[added][1]=${moment(payload.createdDateRange.endDateGMT).unix()}&_cnd[limit][0]=${payload.pageSize *
    (payload.page - 1)}&_cnd[limit][1]=${payload.pageSize}`;

  const response = await this.queryOrders(uri).bind(this);

  if (this.nc.isNonEmptyArray(response.body)) {
    customers = response.body;
  }
  hasMore = customers.length >= pageSize;

  return {
    endpointStatusCode: 200,
    statusCode: hasMore ? 206 : customers.length > 0 ? 200 : 204,
    payload: customers
  };
};

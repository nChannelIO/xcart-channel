"use strict";

module.exports = async function(flowContext, payload) {
  let customers = [];
  let calls = [];

  payload.remoteIDs.forEach(id => {
    calls.push(
      `${this.baseUri}?target=RESTAPI&_key=${
        this.channelProfile.channelAuthValues.apiKey
      }&_schema=complex&_path=profile/${id}`
    );
  });

  let hasMore = false;
  const currentPage = payload.page;
  const currentPageIndex = currentPage - 1;
  const pageSize = payload.pageSize;

  const queries = calls.slice(currentPageIndex * pageSize, currentPage * pageSize);

  const responses = await Promise.all(queries.map(this.queryOrders.bind(this)));

  customers = responses.reduce((result, res) => {
    if (typeof res.body !== "undefined" && res.body != null) {
      result.push(res.body);
    }
    return result;
  }, []);

  const totalCount = calls.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  hasMore = currentPage < totalPages;

  this.info(`Found ${totalCount} total customers.`);
  if (totalCount > 0) {
    this.info(`Returning ${customers.length} customers from page ${currentPage} of ${totalPages}.`);
  }

  return {
    endpointStatusCode: 200,
    statusCode: hasMore ? 206 : customers.length > 0 ? 200 : 204,
    payload: customers
  };
};

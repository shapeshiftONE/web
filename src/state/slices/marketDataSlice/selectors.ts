import { createSelector } from '@reduxjs/toolkit'
import { CAIP19 } from '@shapeshiftoss/caip'
import { HistoryTimeframe } from '@shapeshiftoss/types'
import isEmpty from 'lodash/isEmpty'
import { ReduxState } from 'state/reducer'

export const selectMarketData = (state: ReduxState) => state.marketData.byId

export const selectAssetIdParamMarketData = (_state: ReduxState, assetId: CAIP19) => assetId

export const selectMarketDataById = createSelector(
  selectMarketData,
  selectAssetIdParamMarketData,
  (marketData, assetId) => marketData[assetId],
)

// assets we have loaded market data for
export const selectMarketDataIds = (state: ReduxState) => state.marketData.ids

// if we don't have it it's loading
export const selectMarketDataLoadingById = createSelector(
  selectMarketDataById,
  (assetMarketData): boolean => isEmpty(assetMarketData),
)

export const selectPriceHistory = (state: ReduxState) => state.marketData.priceHistory

export const selectThirdParamTimeFrame = (
  _state: ReduxState,
  _unused: unknown,
  timeframe: HistoryTimeframe,
) => timeframe

selectThirdParamTimeFrame.selectorName = 'selectThirdParamTimeFrame'

export const selectPriceHistoryByAssetTimeframe = createSelector(
  selectPriceHistory,
  selectAssetIdParamMarketData,
  selectThirdParamTimeFrame,
  (priceHistory, assetId, timeframe) => priceHistory[timeframe][assetId] ?? [],
)

export const selectLoadingAssetIdsParam = (
  _state: ReduxState,
  assetIds: CAIP19[],
  _timeframe: HistoryTimeframe,
) => assetIds
selectLoadingAssetIdsParam.selectorName = 'selectLoadingAssetIdsParam'

export const selectPriceHistoriesLoadingByAssetTimeframe = createSelector(
  selectPriceHistory,
  selectLoadingAssetIdsParam,
  selectThirdParamTimeFrame,
  // if we don't have the data it's loading
  (priceHistory, assetIds, timeframe) =>
    !assetIds.every(assetId => Boolean(priceHistory[timeframe][assetId])),
)

export const selectTimeframeParam = (_state: ReduxState, timeframe: HistoryTimeframe) => timeframe
selectTimeframeParam.selectorName = 'selectTimeframeParam'

export const selectPriceHistoryTimeframe = createSelector(
  selectPriceHistory,
  selectTimeframeParam,
  (priceHistory, timeframe) => priceHistory[timeframe],
)

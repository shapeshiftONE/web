import { CAIP19 } from '@shapeshiftoss/caip'
import { chainAdapters, ChainTypes } from '@shapeshiftoss/types'
import { useEffect, useMemo } from 'react'
import { BigNumber, bnOrZero } from 'lib/bignumber/bignumber'
import {
  selectAccountSpecifier,
  selectAssetByCAIP19,
  selectMarketDataById,
} from 'state/slices/selectors'
import {
  ActiveStakingOpportunity,
  selectSingleValidator,
  selectStakingDataIsLoaded,
  selectValidatorIsLoaded,
} from 'state/slices/stakingDataSlice/selectors'
import { stakingDataApi } from 'state/slices/stakingDataSlice/stakingDataSlice'
import { useAppDispatch, useAppSelector } from 'state/store'

const SHAPESHIFT_VALIDATOR_ADDRESS = 'cosmosvaloper199mlc7fr6ll5t54w7tts7f4s0cvnqgc59nmuxf'

type UseCosmosStakingBalancesProps = {
  assetId: CAIP19
}

export type UseCosmosStakingBalancesReturn = {
  activeStakingOpportunities: MergedActiveStakingOpportunity[]
  stakingOpportunities: MergedStakingOpportunity[]
  totalBalance: string
  isLoaded: boolean
}

export type MergedActiveStakingOpportunity = ActiveStakingOpportunity & {
  fiatAmount?: string
  tokenAddress: string
  assetId: CAIP19
  chain: ChainTypes
  tvl: string
}

export type MergedStakingOpportunity = chainAdapters.cosmos.Validator & {
  tokenAddress: string
  assetId: CAIP19
  chain: ChainTypes
  tvl: string
}

export function useCosmosStakingBalances({
  assetId,
}: UseCosmosStakingBalancesProps): UseCosmosStakingBalancesReturn {
  const isStakingDataLoaded = useAppSelector(selectStakingDataIsLoaded)
  const isValidatorDataLoaded = useAppSelector(selectValidatorIsLoaded)
  const isLoaded = isStakingDataLoaded && isValidatorDataLoaded
  const marketData = useAppSelector(state => selectMarketDataById(state, assetId))
  const asset = useAppSelector(state => selectAssetByCAIP19(state, assetId))
  const dispatch = useAppDispatch()

  const accountSpecifiers = useAppSelector(state => selectAccountSpecifier(state, asset?.caip2))
  const accountSpecifier = accountSpecifiers?.[0]

  const shapeshiftValidator = useAppSelector(state =>
    selectSingleValidator(state, accountSpecifier, SHAPESHIFT_VALIDATOR_ADDRESS),
  )
  console.log({ shapeshiftValidator })
  const stakingOpportunities = useMemo(() => {
    return [
      {
        ...shapeshiftValidator,
      },
    ]
  }, [shapeshiftValidator])

  const chainId = asset.caip2

  const mergedActiveStakingOpportunities = useMemo(() => {
    return Object.values(stakingOpportunities).map(opportunity => {
      const fiatAmount = bnOrZero(0)
      // const fiatAmount = bnOrZero(opportunity.cryptoAmount)
      // .div(`1e+${asset.precision}`)
      // .times(bnOrZero(marketData.price))
      // .toFixed(2)
      //
      const tvl = bnOrZero(0)
      // const tvl = bnOrZero(opportunity.tokens)
      // .div(`1e+${asset.precision}`)
      // .times(bnOrZero(marketData?.price))
      // .toString()
      const data = {
        ...opportunity,
        cryptoAmount: bnOrZero(0),
        // cryptoAmount: bnOrZero(opportunity.cryptoAmount)
        // .div(`1e+${asset?.precision}`)
        // .decimalPlaces(asset.precision)
        // .toString(),
        tvl,
        fiatAmount,
        chain: asset.chain,
        assetId,
        tokenAddress: asset.slip44.toString(),
      }
      return data
    })
  }, [assetId, asset, marketData])

  const mergedStakingOpportunities = useMemo(() => {
    return Object.values(stakingOpportunities).map(opportunity => {
      const tvl = bnOrZero(opportunity.tokens)
        .div(`1e+${asset.precision}`)
        .times(bnOrZero(marketData?.price))
        .toString()
      const data = {
        ...opportunity,
        tvl,
        chain: asset.chain,
        assetId,
        tokenAddress: asset.slip44.toString(),
      }
      return data
    })
  }, [assetId, asset, marketData, stakingOpportunities])

  const totalBalance = useMemo(
    () =>
      Object.values(mergedActiveStakingOpportunities).reduce(
        (acc: BigNumber, opportunity: MergedActiveStakingOpportunity) => {
          return acc.plus(bnOrZero(opportunity.fiatAmount))
        },
        bnOrZero(0),
      ),
    [mergedActiveStakingOpportunities],
  )

  useEffect(() => {
    ;(async () => {
      if (!isValidatorDataLoaded) return
    })()
  }, [isValidatorDataLoaded, dispatch, chainId])

  return {
    stakingOpportunities: mergedStakingOpportunities,
    isLoaded,
    totalBalance: totalBalance.toString(),
  }
}

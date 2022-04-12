import { bnOrZero } from '@shapeshiftoss/chain-adapters'
import { chainAdapters } from '@shapeshiftoss/types'
import BigNumber from 'bignumber.js'
import get from 'lodash/get'
import memoize from 'lodash/memoize'

import { PubKey } from './stakingDataSlice'

export const getRewardsAmountByValidatorAddress = memoize(
  (allRewards: Record<PubKey, chainAdapters.cosmos.Reward[]>, validatorAddress: PubKey) => {
    return get<
      Record<PubKey, chainAdapters.cosmos.Reward[]>,
      PubKey,
      chainAdapters.cosmos.Reward[]
    >(allRewards, validatorAddress, [])
      .reduce((acc: BigNumber, rewardEntry: chainAdapters.cosmos.Reward) => {
        acc = acc.plus(bnOrZero(rewardEntry.amount))
        return acc
      }, bnOrZero(0))
      .toString()
  },
  (allRewards: Record<string, chainAdapters.cosmos.Reward[]>, validatorAddress: PubKey) =>
    get<Record<PubKey, chainAdapters.cosmos.Reward[]>, PubKey, chainAdapters.cosmos.Reward[]>(
      allRewards,
      validatorAddress,
      [],
    ),
)

export const getTotalCryptoAmount = (delegationsAmount: string, undelegationsAmount: string) =>
  bnOrZero(delegationsAmount).plus(bnOrZero(undelegationsAmount)).toString()

export const getUndelegationsAmountByValidatorAddress = memoize(
  (
    allUndelegationsEntries: Record<PubKey, chainAdapters.cosmos.UndelegationEntry[]>,
    validatorAddress: PubKey,
  ) => {
    return get<
      Record<PubKey, chainAdapters.cosmos.UndelegationEntry[]>,
      PubKey,
      chainAdapters.cosmos.UndelegationEntry[]
    >(allUndelegationsEntries, validatorAddress, [])
      .reduce(
        (acc: BigNumber, undelegationEntry: chainAdapters.cosmos.UndelegationEntry) =>
          acc.plus(bnOrZero(undelegationEntry.amount)),
        bnOrZero(0),
      )
      .toString()
  },
  (
    allUndelegationsEntries: Record<PubKey, chainAdapters.cosmos.UndelegationEntry[]>,
    validatorAddress: PubKey,
  ) =>
    get<
      Record<PubKey, chainAdapters.cosmos.UndelegationEntry[]>,
      PubKey,
      chainAdapters.cosmos.UndelegationEntry[]
    >(allUndelegationsEntries, validatorAddress, []),
)

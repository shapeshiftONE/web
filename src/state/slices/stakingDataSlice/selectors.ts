import { createSelector } from '@reduxjs/toolkit'
import { CAIP10 } from '@shapeshiftoss/caip'
import { ReduxState } from 'state/reducer'

import { PubKey } from './stakingDataSlice'

export const selectValidatorAddress = (
  _state: ReduxState,
  _accountSpecifier: CAIP10,
  validatorAddress: PubKey,
) => validatorAddress

export const selectValidatorData = (state: ReduxState) => state.validatorData

export const selectSingleValidator = createSelector(
  selectValidatorData,
  selectValidatorAddress,
  (stakingData, validatorAddress) => {
    return stakingData.byValidator[validatorAddress] || null
  },
)

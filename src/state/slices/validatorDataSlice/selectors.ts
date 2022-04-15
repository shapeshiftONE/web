import { createSelector } from '@reduxjs/toolkit'
import { ReduxState } from 'state/reducer'

import { PubKey } from './validatorDataSlice'

export const selectValidatorAddress = (_state: ReduxState, validatorAddress: PubKey) =>
  validatorAddress

export const selectValidatorAddresses = (
  _state: ReduxState,
  _validatorAddress: PubKey,
  validatorAddresses: PubKey[],
) => validatorAddresses

export const selectValidatorData = (state: ReduxState) => state.validatorData

export const selectSingleValidator = createSelector(
  selectValidatorData,
  selectValidatorAddress,
  (stakingData, validatorAddress) => {
    return stakingData.byValidator[validatorAddress] || null
  },
)

export const selectValidatorsDataByIds = createSelector(
  selectValidatorData,
  selectValidatorAddress,
  (stakingData, validatorAddress) => {
    return stakingData.byValidator[validatorAddress] || null
  },
)

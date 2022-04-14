import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CAIP2 } from '@shapeshiftoss/caip'
import { CosmosSdkBaseAdapter } from '@shapeshiftoss/chain-adapters/dist/cosmossdk/CosmosSdkBaseAdapter'
import { chainAdapters, ChainTypes } from '@shapeshiftoss/types'
import { getChainAdapters } from 'context/PluginProvider/PluginProvider'

export type PubKey = string

type SingleValidatorDataArgs = { chainId: CAIP2; validatorAddress: PubKey }

export type StakingDataStatus = 'idle' | 'loading' | 'loaded'

export type Validators = {
  validators: chainAdapters.cosmos.Validator[]
}

export type StakingData = {
  validatorStatus: StakingDataStatus
  byValidator: ValidatorDataByPubKey
  validatorIds: string[]
}

export type ValidatorDataByPubKey = {
  [k: PubKey]: chainAdapters.cosmos.Validator
}

const initialState: StakingData = {
  byValidator: {},
  validatorIds: [],
  validatorStatus: 'idle',
}

const updateOrInsertValidatorData = (
  stakingDataState: StakingData,
  validators: chainAdapters.cosmos.Validator[],
) => {
  validators.forEach(validator => {
    stakingDataState.validatorIds.push(validator.address)
    stakingDataState.byValidator[validator.address] = validator
  })
}

type StakingDataStatusPayload = { payload: StakingDataStatus }

export const stakingData = createSlice({
  name: 'stakingData',
  initialState,
  reducers: {
    clear: () => initialState,
    setValidatorStatus: (state, { payload }: StakingDataStatusPayload) => {
      state.validatorStatus = payload
    },
    upsertValidatorData: (
      stakingDataState,
      { payload }: { payload: { validators: chainAdapters.cosmos.Validator[] } },
    ) => {
      // TODO(gomes): Improve the structure of this when we have cosmos websocket, for now this just inserts
      updateOrInsertValidatorData(stakingDataState, payload.validators)
    },
  },
})

export const stakingDataApi = createApi({
  reducerPath: 'stakingDataApi',
  // not actually used, only used to satisfy createApi, we use a custom queryFn
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  // refetch if network connection is dropped, useful for mobile
  refetchOnReconnect: true,
  endpoints: build => ({
    getValidatorData: build.query<chainAdapters.cosmos.Validator, SingleValidatorDataArgs>({
      queryFn: async ({ chainId, validatorAddress }, { dispatch }) => {
        const chainAdapters = getChainAdapters()
        const adapter = (await chainAdapters.byChainId(
          chainId,
        )) as CosmosSdkBaseAdapter<ChainTypes.Cosmos>
        dispatch(stakingData.actions.setValidatorStatus('loading'))
        try {
          const data = await adapter.getValidator(validatorAddress)
          dispatch(
            stakingData.actions.upsertValidatorData({
              validators: [data],
            }),
          )
          return {
            data: data,
          }
        } catch (e) {
          console.error('Error fetching single validator data', e)
          return {
            error: {
              data: `Error fetching staking data`,
              status: 500,
            },
          }
        } finally {
          dispatch(stakingData.actions.setValidatorStatus('loaded'))
        }
      },
    }),
  }),
})

import concat from 'lodash/concat'
import banxalogo from 'assets/banxa.png'
import gemlogo from 'assets/gem-mark.png'
import onjunologo from 'assets/onjuno.png'

import { createBanxaUrl, getCoins } from './fiatRampProviders/banxa'
import {
  fetchCoinifySupportedCurrencies,
  fetchWyreSupportedCurrencies,
  makeGemPartnerUrl,
  parseGemBuyAssets,
  parseGemSellAssets,
} from './fiatRampProviders/gem'
import { FiatRampAction, FiatRampCurrency } from './FiatRampsCommon'

export interface SupportedFiatRampConfig {
  label: string
  info?: string
  logo: string
  readyToUse: boolean
  getBuyAndSellList: () => Promise<[FiatRampCurrency[], FiatRampCurrency[]]>
  onSubmit: (action: FiatRampAction, asset: string, address: string) => void
}

export enum FiatRamps {
  Gem = 'Gem',
  OnJuno = 'OnJuno',
  Banxa = 'Banxa',
}

export const supportedFiatRamps: Record<FiatRamps, SupportedFiatRampConfig> = {
  [FiatRamps.Gem]: {
    label: 'fiatRamps.gem',
    info: 'fiatRamps.gemMessage',
    logo: gemlogo,
    getBuyAndSellList: async () => {
      const coinifyAssets = await fetchCoinifySupportedCurrencies()
      const wyreAssets = await fetchWyreSupportedCurrencies()
      const currencyList = concat(coinifyAssets, wyreAssets)
      const parsedBuyList = parseGemBuyAssets(currencyList)
      const parsedSellList = parseGemSellAssets(currencyList)
      return [parsedBuyList, parsedSellList]
    },
    onSubmit: async (action, asset, address) => {
      const gemPartnerUrl = makeGemPartnerUrl(action, asset, address)
      window.open(gemPartnerUrl, '_blank')?.focus()
    },
    readyToUse: true,
  },
  [FiatRamps.Banxa]: {
    label: 'fiatRamps.banxa',
    info: 'fiatRamps.banxaMessage',
    logo: banxalogo,
    readyToUse: true,
    getBuyAndSellList: async () => {
      const coins = await getCoins()
      return [coins, coins]
    },
    onSubmit: async (action: FiatRampAction, asset: string, address: string) => {
      const banxaCheckoutUrl = await createBanxaUrl(action, asset, address)
      window.open(banxaCheckoutUrl, '_blank')?.focus()
    },
  },
  [FiatRamps.OnJuno]: {
    label: 'fiatRamps.onJuno',
    logo: onjunologo,
    readyToUse: false,
    getBuyAndSellList: async () => [[], []],
    onSubmit: async () => {},
  },
}

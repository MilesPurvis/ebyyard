import {
  useFeatureGate as useStatsigFeatureGate,
  useFeatureGateValue as useStatsigFeatureGateValue,
  useDynamicConfig as useStatsigDynamicConfig,
  useExperiment as useStatsigExperiment
} from '@statsig/react-bindings'

/**
 * Hook to check if a feature gate is enabled
 * @param {string} gateName - The name of the feature gate
 * @returns {boolean} - Whether the gate is enabled
 *
 * @example
 * const isNewFeatureEnabled = useFeatureGate('new_feature')
 */
export function useFeatureGate(gateName) {
  const gateValue = useStatsigFeatureGate(gateName)

  // Statsig returns an object with a 'value' property containing the boolean
  // Handle both object format and direct boolean (for backwards compatibility)
  if (typeof gateValue === 'boolean') {
    return gateValue
  }

  if (gateValue && typeof gateValue === 'object' && 'value' in gateValue) {
    return gateValue.value === true
  }

  // Fallback: if Statsig isn't initialized or returns unexpected format
  // Default to false (show prices) for safety
  return false
}

/**
 * Hook to get the value of a feature gate
 * @param {string} gateName - The name of the feature gate
 * @returns {boolean} - The value of the gate
 *
 * @example
 * const isEnabled = useFeatureGateValue('new_feature')
 */
export function useFeatureGateValue(gateName) {
  return useStatsigFeatureGateValue(gateName)
}

/**
 * Hook to get a dynamic config value
 * @param {string} configName - The name of the dynamic config
 * @returns {object} - The config object with .get() method
 *
 * @example
 * const config = useDynamicConfig('my_config')
 * const value = config.get('key', 'default')
 */
export function useDynamicConfig(configName) {
  return useStatsigDynamicConfig(configName)
}

/**
 * Hook to get experiment configuration
 * @param {string} experimentName - The name of the experiment
 * @returns {object} - The experiment object with .get() method and .group property
 *
 * @example
 * const experiment = useExperiment('my_experiment')
 * const variant = experiment.group
 * const value = experiment.get('key', 'default')
 */
export function useExperiment(experimentName) {
  return useStatsigExperiment(experimentName)
}

/**
 * Convenience hook that combines common Statsig operations
 * @param {string} gateName - The name of the feature gate to check
 * @returns {object} - Object with isEnabled boolean and helper methods
 *
 * @example
 * const { isEnabled } = useFeatureFlag('new_feature')
 * if (isEnabled) {
 *   // Show new feature
 * }
 */
export function useFeatureFlag(gateName) {
  const isEnabled = useFeatureGate(gateName)

  return {
    isEnabled,
    // Helper to conditionally render
    renderIfEnabled: (component) => isEnabled ? component : null,
  }
}

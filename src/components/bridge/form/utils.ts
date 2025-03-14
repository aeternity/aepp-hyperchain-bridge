export const validateForm = (
  selectedNetworkId: string,
  selectedTokenAddress: string,
  amount: string,
  setErrors: (errors: { [key: string]: string }) => void,
) => {
  const _errors: { [key: string]: string } = {};

  if (!selectedNetworkId) {
    _errors.network = "Please select a network";
  }

  if (!selectedTokenAddress) {
    _errors.token = "Please select a token";
  }

  if (!amount) {
    _errors.amount = "Please enter an amount";
  }

  setErrors(_errors);
  return _errors;
};

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'contact/[id]': { id: string };
  'contact/add': undefined;
  'contact/edit/[id]': { id: string };
};

export type AuthParamList = {
  login: undefined;
};

export type TabParamList = {
  index: undefined;
  search: undefined;
  settings: undefined;
};

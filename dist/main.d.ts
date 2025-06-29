declare module "@keithclark/tiny-parsers" {
  const NODE_TYPE_ELEMENT = 1;
  const NODE_TYPE_TEXT = 2;
  const NODE_TYPE_COMMENT = 3;
  const NODE_TYPE_DOCTYPE = 4;
  type SgmlAttributeList = {
      [entity: string]: string;
    } 
  type SgmlElement = {
    type: 1;
    name: string;
    attributes: SgmlAttributeList;
    children: SgmlNode[];
  };
  type SgmlText = {
    type: 2;
    value: string;
  };
  type SgmlComment = {
    type: 3;
    value: string;
  };
  type SgmlDoctype = {
    type: 4;
    name: string;
    legacyString: string;
  };
  type SgmlNode = SgmlElement | SgmlText | SgmlComment | SgmlDoctype;
  type SgmlNodeList = SgmlNode[];
  type SgmlParseOptions = {
    namedEntityMap: {
      [entity: string]: string;
    };
    voidElements: string[];
    textElements: string[];
  };
  type SgmlStringinfyOptions = {
    voidElements: string[];
    textElements: string[];
  };
  function parseSgml(code: string, options?: SgmlParseOptions): SgmlNode[];
  function stringifySgml(nodes: SgmlNode[], options?: SgmlStringinfyOptions): string;
  function parseHtml(code: string, options?: SgmlParseOptions): SgmlNode[];
  function stringifyHtml(nodes: SgmlNode[], options?: SgmlStringinfyOptions): string;
  const RULE_TYPE_DECLARATION = 1;
  const RULE_TYPE_RULESET = 2;
  const RULE_TYPE_AT_RULE_BLOCK = 3;
  const RULE_TYPE_AT_RULE_STATEMENT = 4;
  type CssDeclaration = {
    type: 1;
    property: string;
    value: string;
  };
  type CssRuleset = {
    type: 2;
    selector: string;
    declarations: CssNode[];
  };
  type CssAtRuleBlock = {
    type: 3;
    identifier: string;
    rule: string;
    declarations: CssNode[];
  };
  type CssAtRuleStatement = {
    type: 4;
    identifier: string;
    rule: string;
  };
  type CssNode = CssDeclaration | CssRuleset | CssAtRuleBlock | CssAtRuleStatement;
  function parseCss(code: string): CssNode[];
  function stringifyCss(nodes: CssNode[]): string;
}

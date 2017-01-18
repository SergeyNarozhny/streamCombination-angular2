/**
 * Base entity
 */
export class Entity {
	id: string | number;
	name: string;
	approvedBy: string;
	approvedOn: string;
	updatedBy: string;
	updatedOn: string;
	label: string;
	reportLabel: string;
	syntheticId: string;
	empty: boolean;
	generatedName: string;
};

/**
 * Fund specific
 */
export class Fund {
	clientClientVisible: boolean;
	clientDemoType: string;
	clientId: number;
	clientLongName: string;
	clientName: string;
	fundClientVisible: boolean;
	fundDemoType: string;
	fundGfcId: string;
	fundId: number;
	fundLongName: string;
	fundName: string;
	fundRegX: boolean;
	fundUbti: boolean;
	investManagerClientVisible: boolean;
	investManagerDemoType: string;
	investManagerEqTopAcct: string;
	investManagerGfcId: string;
	investManagerId: number;
	investManagerLongName: string;
	investManagerName: string;
};

export class FundInfo {
	act1940Fund: boolean;
	baseCurrency: string;
	citiAffiliateFund: boolean;
	citiMarginStatus: string;
	countryOfDomicile: string;
	demoType: string;
	eqEnabled: boolean;
	eqIPBTopAcct: boolean;
	erisa: boolean;
	fundStatus: string;
	fundStrategy: string;
	mirror: boolean;
	pfId: number;
	regX: number;
	reportingPriority: string;
	ubti: string;
};

export class FundAttributes {
	arrangingMethod: string;
	arrangingType: string;
	baseCurrency: string;
	cbnaCollateral: boolean;
	cbnaSwapMarginType: string;
	cgmlSwapMarginType: string;
	cssiLongCashBuffer: string;
	cssiLongSecurityBuffer: string;
	cssiLongStockSeg: string;
	cssiRehypothecation: string;
	description: string;
	enableCrossMarginOfFutures: boolean;
	excessBufferAdjustment: string;
	feeBased: boolean;
	fipbClearingDeposit: string;
	fipbMarginGroupIsUserDefined: string;
	leverageOffering: string;
	marginPlatform: string;
	minNetEquityRequirement: string;
	name: string;
	offeringType: string;
	profileStatus: string;
	regExcessBuffer: string;
	region: string;
	uspbOfferingType: string;
};

export class AssignedFund extends Entity {
	defaultNettingGroup: NettingGroup;
	eligibleForDemoWorkflow: boolean;
	eligibleForLiveWorkflow: boolean;
	gfcId: string;
	nonMarginableAccounts: Array<Account>;
	nonMarginableAttributes: MarginableAttributes;
	profiles: Array<Template>;
};

export class FundDetail extends Entity {
	investManagers: Array<InvestManager>;
};

export class MpsFund extends Entity {
	@type: string;
	allAccounts: Array<Account>;
	conflicts: any[];
	defaultNettingGroup: NettingGroup;
	eligibleForDemoWorkflow: boolean;
	eligibleForLiveWorkflow: boolean;
	fundHierarchy: Fund;
	fundInfo: FundInfo;
	indirectAccountsMarginingMode: string;
	isApproveAllowedForCurrentUser: string;
	masterPendingChangeId: number;
	nonMarginableAccounts: any[];
	nonMarginableAttributes: MarginableAttributes;
	ownPendingChange: boolean;
	pendingChange: boolean;
	pendingChangeApprovalStepId: number;
	pendingChangeId: number;
	pendingChangeStatus: string;
	pendingChangeType: string;
	profiles: Array<Template>;
	testRunReportFileNames: any[];
};

/**
 * Supporting
 */
export class InvestManager extends Entity {
	funds: Array<AssignedFund>;
	gfcId: string;
};

export class MarginGroup extends Entity {
	accounts: Array<Account>;
	fipbClearingDepositAssigned: string;
	marginGroupType: string;
	marginMultiplier: string;
	mcatId: number;
	methodologies: any[];
	oasysCbnaAgreement: string;
	proposedMethodologies: any[];
};

export class NettingGroup extends Entity {
	altGroupId: string;
	marginGroupStatus: string;
	marginGroups: Array<MarginGroup>;
	mcatId: number;
	region: string;
	pfGrpId: number;
	tempAltGroupId: number;
	reportingType: string;
	runInGmi768Batch: boolean;
	runInPendingActBatch: boolean;
};

export class MarginableAttributes {
	altGroupId: string;
	nettingGroupId: number;
	pfGrpId: number;
};

export class Account extends Entity {
	accountMnemonic: string;
	assetOwnerId: number;
	baseAgreement: string;
	baseCurrency: string;
	citiEntity: string;
	client: string;
	cpiNumber: number;
	date_updated: string;
	eqIPBRootId: string;
	eqLoanetLinkAcct: string;
	firmCode: string;
	fund: string;
	gfcid: string;
	gmiNumber: number;
	hasBillingTerms: boolean;
	imsNumber: string;
	isAccountEligibleForLive: boolean;
	legalEntity: string;
	message: string;
	primeCustdyLinkImsNumber: string;
	primeCustodyInd: string;
	product: string;
	region: string;
	status: string;
};

/**
 * Profile specific
 */
export class ProfileAttributesCriteria {
	cbnaSwapMarginType: any[];
	cgmlSwapMarginType: any[];
	enableCrossMarginOfFutures: any[];
	leverageOffering: any[];
	marginPlatform: any[];
	offeringType: any[];
	swapMarginType: any[];
	uspbOfferingType: any[];
};

export class Configurations {
	accountCriteria: string;
	displayName: string;
	methodology: number;
	mnemonic: string;
	profileAttributesCriteria: ProfileAttributesCriteria;
};

export class BaseMethodologyGroup {
	id: string;
	name: string;	
};

export class GroupConfigurations {
	configurations: Array<Configurations>;
	methodologyGroup: BaseMethodologyGroup;
};

export class MethodologiesConfiguration {
	groupConfigurations: Array<GroupConfigurations>;
};

export class Restrictions {
	enumeration: any[];
	fieldName: string;
	fractionDigits: number;
	length: number;
	maxExclusive: number;
	maxInclusive: number;
	maxLength: number;
	minExclusive: number;
	minInclusive: number;
	minLength: number;
	pattern: string;
	totalDigits: number;
	whiteSpace: number;
};

/**
 * Template secific
 */
export class Template extends Entity {
	attributes: FundAttributes;
	base: any;
	description: string;
	fundId: number;
	isAbstract: boolean;
	methodologiesConfiguration: MethodologiesConfiguration;
	mnemonic: string;
	restrictions: Array<Restrictions>;
	nettingGroups: Array<NettingGroup>;
	templateId: number;
};

export class MethodologyTags {
	id: string;
	name: string;
	userAssignable: boolean;
};

export class ListInfo extends Entity {
	default: boolean;
	descr: string;
	finraHouseEquityNotIncludingOptionsNonLeaps: boolean;
	group: BaseMethodologyGroup;
	type: BaseMethodologyGroup;
	marginMultiplier: string;
	methodologyTags: Array<MethodologyTags>;
	mnemonic: string;
	title: string;
};

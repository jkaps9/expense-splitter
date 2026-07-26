# Sample data: groups & expenses

## Files

| File | Format | Purpose |
|------|--------|---------|
| `sample-groups.json` | JSON | 5 sample groups with realistic expenses, for seeding the guest experience |

The file contains 5 curated groups with different characteristics, realistic expenses, and intentional edge cases for testing.

**Schema notes:** Each expense and settlement carries an `exchangeRate` field, the rate from its currency to the group's default currency, captured at the time of the expense, so guest balances stay stable without a live API call. One member (Dev Okafor in Camping Weekend) has no email: a "name-only" member added without an account who still participates in splits. Balances are derived purely from expenses and settlements (there is no per-expense `settled` flag).

## Data shape

The TypeScript below describes the JSON structure. `shares` appears only on shares splits, `percentage` only on percentage splits, and `email` is omitted for name-only members.

```ts
type CurrencyCode = string; // ISO 4217, e.g. "USD", "JPY", "EUR"
type SplitType = "equal" | "exact" | "percentage" | "shares";

interface Member {
  id: string;
  name: string;
  email?: string;       // omitted for name-only members (e.g. Dev Okafor)
  avatarColor: string;  // hex, used for the avatar circle
}

interface Split {
  memberId: string;
  amount: number;       // share in the expense's currency; splits sum to `amount`
  shares?: number;      // present only when splitType === "shares"
  percentage?: number;  // present only when splitType === "percentage"
}

interface Expense {
  id: string;
  description: string;
  amount: number;       // in `currency`
  currency: CurrencyCode;
  exchangeRate: number; // rate from `currency` to the group's default currency, at expense time
  paidBy: string;       // Member id
  splitType: SplitType;
  splits: Split[];
  date: string;         // ISO 8601
  category: string;     // one of the 9 predefined categories, or a custom one
  notes?: string;
  recurring?: "weekly" | "biweekly" | "monthly";
}

interface Settlement {
  id: string;
  from: string;         // Member id (payer)
  to: string;           // Member id (recipient)
  amount: number;       // in `currency`
  currency: CurrencyCode;
  exchangeRate: number; // to the group's default currency
  date: string;         // ISO 8601
}

interface Group {
  id: string;
  name: string;
  description: string;
  currency: CurrencyCode; // group default; balances are computed in this
  createdAt: string;      // ISO 8601
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
}

interface SampleData {
  groups: Group[];
}
```

## Sample groups

### Trip to Japan (4 members, 13 expenses)

A travel group with 4 friends on a 2-week trip. Features mixed currencies (USD, JPY, and EUR), varied split types (equal, exact, shares), a mix of settled and outstanding balances, and categories spanning Accommodation, Food & Drink, Transport, Entertainment, Shopping, and Groceries.

**Members:** Alex Chen, Jordan Park, Sam Rivera, Taylor Kim

**What makes it interesting:**
- Mixed currencies (JPY, USD, and EUR) in the same group, requiring conversion
- Multiple split types beyond equal (exact amounts for the ryokan, shares for the izakaya dinner)
- Some expenses exclude members (Osaka Castle, which Taylor skipped)
- Two partial settlements already recorded (one in USD, one in JPY)
- Expenses with notes explaining the split logic

### Apartment 4B (3 roommates, 10 expenses)

A recurring household expense group for 3 roommates. Primarily USD, featuring monthly recurring expenses (rent, internet), variable recurring expenses (electricity), and one-off shared costs (plumber, cleaning supplies).

**Members:** Riley Morgan, Casey Brooks, Drew Patel

**What makes it interesting:**
- Unequal rent split (Riley has the master bedroom: $1,400 vs. $1,100 each)
- Mix of settled (January) and unsettled (February) expenses
- Recurring expense markers for rent, internet, and Netflix
- January fully settled with recorded settlements; February has outstanding balances

### Office Lunch Crew (4 members, 8 expenses)

A casual, ongoing group for coworkers splitting weekly lunches and coffee runs. All USD, mostly equal splits with one percentage split.

**Members:** Mia Torres, Noah Williams, Priya Sharma, Ethan Nakamura

**What makes it interesting:**
- High-frequency, low-stakes use case (the most common real-world pattern)
- One excluded member (sandwich shop, where Priya was out sick)
- Percentage split for sushi lunch (different portion sizes)
- No settlements yet, an ongoing group that settles up periodically

### Sarah's Birthday Present (4 members, 4 expenses)

A one-off occasion group for chipping in on a birthday gift, dinner deposit, decorations, and flowers. All USD, mix of exact and equal splits. Mostly settled.

**Members:** Olivia Hayes, Ben Gutierrez, Chloe Yun, Marcus Webb

**What makes it interesting:**
- Short-lived group with a clear purpose and resolution
- Exact splits with uneven contributions (everyone chipped in what they could for the gift)
- One expense with only 2 of 4 members participating (flowers)
- Nearly fully settled, with one small remaining debt (Chloe owes Ben $14.37)

### Camping Weekend (5 members, 8 expenses)

A short-term trip group for a weekend camping trip. All USD, mostly equal splits with one exact split. No settlements yet.

**Members:** Jake Foster, Lily Tran, Omar Hassan, Rachel Kim, Dev Okafor

**What makes it interesting:**
- Largest group (5 members), which tests balance display with more people
- Exact split with a $0.00 member (gas: Jake drove, so passengers split the cost)
- 5-way rounding edge cases ($34.99 / 5)
- Fresh group with no settlements, so all debts outstanding
- Dev Okafor is a name-only member (no email/account), added by name and still included in splits

## Edge cases

The sample data includes intentional edge cases that test careful financial data handling. These reflect real-world issues you'll encounter building an expense-splitting app.

### Rounding & precision

| Edge case | Where | What to handle |
|-----------|-------|----------------|
| **4-way split with remainder** | Office Lunch Crew, exp_202 ($24.50) | $24.50 / 4 = $6.125, which splits to $6.13 + $6.13 + $6.12 + $6.12. Verify the sum equals the total. |
| **3-way split with remainder** | Apartment 4B, exp_102 ($142.37) | $142.37 / 3 = $47.4567, which splits to $47.46 + $47.46 + $47.45. |
| **5-way split with remainder** | Camping Weekend, exp_405 ($34.99) | $34.99 / 5 = $6.998, which splits to $7.00 + $7.00 + $7.00 + $7.00 + $6.99. |
| **Unequal JPY splits** | Trip to Japan, exp_006 (¥4,850) | ¥4,850 / 4 = ¥1,212.50, but JPY has no decimal places. Splits are ¥1,213 + ¥1,213 + ¥1,212 + ¥1,212. |

### Split type variations

| Edge case | Where | What to handle |
|-----------|-------|----------------|
| **Exact amount split** | Trip to Japan, exp_005 (ryokan), exp_008 (shopping) | Custom amounts per person that sum to the total. Validate the sum matches. |
| **Percentage split** | Office Lunch Crew, exp_207 (sushi) | 30/20/30/20 split. Your UI should handle cases where percentages don't sum to 100%. |
| **Shares split** | Trip to Japan, exp_012 (izakaya) | 2:2:1:1 shares. Alex and Jordan each pay 2/6, Sam and Taylor each pay 1/6. |
| **Excluded members** | Trip to Japan, exp_010; Office Lunch Crew, exp_205 | Not all group members participate in every expense. |
| **2-of-4 member expense** | Sarah's Birthday, exp_304 (flowers) | Only Olivia and Marcus split this expense; Ben and Chloe aren't included at all. |
| **$0 split for one member** | Camping Weekend, exp_404 (gas) | Jake's split is $0.00 because he drove. Others split the cost. |

### Financial edge cases

| Edge case | Where | What to handle |
|-----------|-------|----------------|
| **Mixed currencies in one group** | Trip to Japan | JPY, USD, and EUR expenses in the same group. Balances need currency conversion to the group's default currency (USD), using each expense's stored `exchangeRate`. |
| **Settlement in a different currency** | Trip to Japan, stl_001 (USD) and stl_002 (JPY) | Settlements in different currencies within the same mixed-currency group. |
| **Partial settlements** | Trip to Japan | Settlements that don't fully resolve all debts, so balances should reflect remaining amounts. |
| **Nearly settled group** | Sarah's Birthday | Most debts resolved. One small remaining balance: Chloe owes Ben $14.37. |
| **Unequal recurring split** | Apartment 4B, exp_101 and exp_106 | An "exact" split where one person pays more ($1,400 vs. $1,100), repeated monthly. |

### Data consistency

| Edge case | What to handle |
|-----------|----------------|
| **Splits that don't perfectly sum** | Due to rounding, some splits may be off by $0.01 from the expense total. Your app should handle this gracefully: either adjust the last split or show the discrepancy. |
| **Settlement in a different currency than expenses** | Trip to Japan has a JPY settlement (stl_002) and a USD settlement (stl_001) for a group with mixed-currency expenses. How do you apply these to balances? |

## Using the sample data

### For the guest experience

Use `sample-groups.json` to seed the guest dashboard. The 5 groups with 43 total expenses across various categories provide a compelling first impression that demonstrates all the app's features.

**Recommended approach:**
1. On "Try as Guest", load the sample data into session state
2. Display the group list with all 5 groups and their summary balances
3. Allow full exploration: view expenses, see balances, explore settlement suggestions
4. The variety of group types (travel, roommates, casual lunches, one-off occasion, short trip) shows the product's versatility

**Frontend-only path:** there's no separate guest mode. Seed this data into localStorage on first run as the app's starting state, and let the user's edits persist from there. See the [frontend-only alternative](../spec/technical-requirements.md#frontend-only-alternative).

### For development & testing

The data is designed to exercise your implementation with realistic scenarios. As you build, verify:

- All balance calculations are consistent (sum of all balances in a group = 0)
- Currency conversion produces reasonable results for the mixed-currency group
- Rounding edge cases display cleanly without showing errors
- Different split types render correctly in the expense list
- Settlement suggestions make sense given the current balances
- The 5-member group displays well (balance layout doesn't break with more members)

**Note:** Each expense and settlement in the sample data includes a representative `exchangeRate` to the group's default currency, captured at expense time. This keeps the guest experience's balances stable and models the spec's "store the rate at the time of the expense" requirement. For expenses your users create live, fetch current rates from your currency API rather than hardcoding them.

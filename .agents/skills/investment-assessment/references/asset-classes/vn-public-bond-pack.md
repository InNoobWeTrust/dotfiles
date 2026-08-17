# Regional pack: VN (and similar) public bond offers

Sub-module of `credit-fixed-income.md`. Use when the market is Vietnam corporate public offer (chào bán ra công chúng) or analogous distributor-hosted packs. Adapt names for other markets.

## Doc ladder (prefer top)

1. **Distributor hub** (e.g. securities firm announcement page) with full attachment list  
2. **Bản cáo bạch** (prospectus)  
3. **Điều khoản và điều kiện trái phiếu** (bond terms — often TGĐ decision annex)  
4. **Hướng dẫn đặt mua** (subscription guide: min ticket, deposit %, calendar, escrow)  
5. Registration certificate / SSC letters  
6. Listing commitment, investor commitment letters  
7. Bondholder representative agreement  
8. Rating reports (note **issuer vs issue**)  
9. Audited/reviewed financials annexes  
10. Marketing “cơ hội đầu tư” decks — **last**, cross-check only  

## Typical fields to extract (VN retail)

| Field | Notes |
|---|---|
| Không chuyển đổi / không chứng quyền / **không có bảo đảm** | Unsecured flag |
| Mệnh giá | Often 100,000 VND |
| Lãi suất cố định + kỳ trả lãi | e.g. 10%/year, quarterly |
| Kỳ hạn | e.g. 24 months bullet |
| Số lượng đặt mua tối thiểu | Hard primary floor |
| Tiền đặt cọc | e.g. 2% — forfeiture rules matter |
| Tài khoản phong tỏa | Only wire here |
| Đại lý phân phối | Licensed channels only |
| Đại diện NSHTP | Not automatically a guarantor |
| Đăng ký VSDC + niêm yết HNX | Transfer path; deadline often ≤30 days after close |
| Thứ tự ưu tiên | Pari passu unsecured language common |
| Sự kiện vi phạm | Grace days, cross-default, covenants |
| Thuế | Prospectus may state **TNCN 5% on interest**, **0.1% on transfer price**; **no gross-up** |
| Mục đích sử dụng vốn | Match to business risk |

## OCR protocol for scanned PDFs

1. Try text extract (pypdf/pymupdf).  
2. If empty: `pdftoppm` + `tesseract -l vie+eng` on **terms, ranking, tax, EoD, recovery tables**.  
3. Quote OCR with uncertainty; prefer re-read of official file before subscribe.  
4. Never fill gaps with “standard market practice” presented as fact.

## Process red flags

- Pressure to pay personal accounts  
- “Friend pool” below min ticket without licensed fund structure  
- Terms only in chat screenshots  
- Guarantee claimed verbally but absent in terms  
- Rating screenshot without full report date/entity  

## Calendar pattern (example shape)

Register/deposit window → allocation notice → pay remainder → issue → VSDC → listing file.  
Always re-verify dates on the live notice.

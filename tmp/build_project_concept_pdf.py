from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

OUT = '/home/divy/Sparks_Client/output/pdf/supplychain-ai-integrated-recommendation-system.pdf'
NAVY = colors.HexColor('#102A43')
TEAL = colors.HexColor('#087F8C')
CYAN = colors.HexColor('#0EA5B7')
INK = colors.HexColor('#243B53')
MUTED = colors.HexColor('#627D98')
PALE = colors.HexColor('#F0F7FA')
GREEN = colors.HexColor('#0F9D72')

s = getSampleStyleSheet()
s.add(ParagraphStyle(name='TitleX', parent=s['Title'], fontName='Helvetica-Bold', fontSize=26, leading=31, textColor=colors.white, spaceAfter=10))
s.add(ParagraphStyle(name='SubX', parent=s['Normal'], fontSize=12, leading=18, textColor=colors.HexColor('#D9F4F5')))
s.add(ParagraphStyle(name='H1X', parent=s['Heading1'], fontName='Helvetica-Bold', fontSize=19, leading=24, textColor=NAVY, spaceAfter=9))
s.add(ParagraphStyle(name='H2X', parent=s['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=TEAL, spaceBefore=7, spaceAfter=5))
s.add(ParagraphStyle(name='BodyX', parent=s['BodyText'], fontSize=9.5, leading=14, textColor=INK, spaceAfter=7))
s.add(ParagraphStyle(name='SmallX', parent=s['BodyText'], fontSize=8, leading=11, textColor=MUTED))
s.add(ParagraphStyle(name='QuoteX', parent=s['BodyText'], fontName='Helvetica-Oblique', fontSize=11, leading=16, textColor=NAVY, leftIndent=12, rightIndent=12, spaceAfter=9))
s.add(ParagraphStyle(name='CellHead', parent=s['BodyText'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.white))
s.add(ParagraphStyle(name='Cell', parent=s['BodyText'], fontSize=8.5, leading=11, textColor=INK))

def P(text, style='BodyX'):
    return Paragraph(text, s[style])

def hf(canvas, doc):
    canvas.saveState()
    w, _ = A4
    canvas.setStrokeColor(colors.HexColor('#D9E2EC'))
    canvas.line(18*mm, 14*mm, w-18*mm, 14*mm)
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18*mm, 9*mm, 'SupplyChain-AI | Integrated warehouse decision support')
    canvas.drawRightString(w-18*mm, 9*mm, str(doc.page))
    canvas.restoreState()

def table(rows, widths, header=NAVY):
    data = []
    for r, row in enumerate(rows):
        data.append([P(str(c), 'CellHead' if r == 0 else 'Cell') for c in row])
    return Table(data, colWidths=widths, style=TableStyle([
        ('BACKGROUND', (0,0), (-1,0), header), ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor('#CBD5E0')),
        ('BACKGROUND', (0,1), (-1,-1), PALE), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 7), ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))

story = []
cover = Table([[P('SupplyChain-AI', 'TitleX')], [P('An integrated warehouse management and geospatial recommendation system', 'SubX')], [P('Project concept and demonstration outline', 'SubX')]], colWidths=[174*mm], style=TableStyle([('BACKGROUND', (0,0), (-1,-1), NAVY), ('LEFTPADDING', (0,0), (-1,-1), 18), ('RIGHTPADDING', (0,0), (-1,-1), 18), ('TOPPADDING', (0,0), (-1,-1), 16), ('BOTTOMPADDING', (0,0), (-1,-1), 16)]))
story += [Spacer(1, 22*mm), cover, Spacer(1, 18), P('The system combines real warehouse operations with a geospatial decision-support layer. It uses historical demand and warehouse accessibility to recommend where warehouse capacity should be prioritized, then connects that recommendation to orders, inventory, alerts, and auditability.', 'QuoteX'), P('Core project statement', 'H2X'), P('SupplyChain-AI is an AI-assisted warehouse network recommendation and decision-support system integrated with a real warehouse management platform.')]
story += [Spacer(1, 10), table([['Research contribution', 'Operational contribution'], ['Geospatial analysis of demand, coverage, candidate locations, and network performance.', 'Live order, inventory, fulfillment, alerts, and audit workflows.']], [85*mm, 85*mm], TEAL), PageBreak()]

story += [P('1. Purpose of the proposed solution', 'H1X'), P('Existing warehouses may not serve customer demand equally. Some demand areas can be far from a warehouse, outside a service threshold, or assigned to facilities with limited capacity. The proposed system turns this problem into a measurable planning decision.', 'BodyX'), P('The research question', 'H2X'), P('Can a demand-informed, geospatial warehouse network recommendation improve service coverage and reduce delivery distance, time, and estimated transportation cost compared with the nearest-existing-warehouse baseline?', 'QuoteX'), P('System flow', 'H2X')]
flow = [['1. Live data', '2. Analysis', '3. Recommendation', '4. Operations'], ['Orders, coordinates, inventory, warehouses, capacity', 'Demand clusters, coverage, accessibility, candidate scoring', 'Prioritized candidate locations and expected impact', 'Orders, stock, alerts, fulfillment, audit trail']]
story += [table(flow, [42*mm, 42*mm, 42*mm, 42*mm], TEAL), Spacer(1, 10), P('Important design principle', 'H2X'), P('The system recommends; a manager approves. It does not automatically open a warehouse or make an irreversible investment decision. This keeps the solution practical, explainable, and safe for real operations.', 'BodyX'), P('Inputs used by the recommendation engine', 'H2X')]
inputs = [['Input', 'Purpose'], ['Customer order locations', 'Identify where demand is concentrated.'], ['Existing warehouse coordinates', 'Measure current access and service coverage.'], ['Order quantity and value', 'Represent demand intensity and business importance.'], ['Capacity and utilization', 'Avoid recommending locations that cannot support demand.'], ['Distance and estimated time', 'Compare service performance and transport impact.']]
story += [table(inputs, [58*mm, 112*mm], NAVY), PageBreak()]

story += [P('2. How to demonstrate the system', 'H1X'), P('The demonstration should present one connected story: research recommendation first, then operational proof.', 'BodyX')]
demo = [['Step', 'What to show', 'What it proves'], ['1. Research outcome', 'Generate the warehouse network recommendation.', 'The system produces an evidence-based planning decision.'], ['2. Candidate locations', 'Show the highest-ranked demand-informed locations.', 'The recommendation is based on customer geography.'], ['3. Before and after', 'Compare coverage, distance, time, underserved orders, and cost.', 'The research result is measurable.'], ['4. Create an order', 'Create a customer order with a real location and product.', 'The recommendation layer is connected to the WMS.'], ['5. Fulfill and deduct', 'Reserve stock, fulfill the order, and show stock deduction.', 'The operational workflow is live and synchronized.'], ['6. Alert and audit', 'Show a low-stock alert and the recorded audit action.', 'The solution supports monitoring and accountability.']]
story += [table(demo, [27*mm, 72*mm, 71*mm], NAVY), Spacer(1, 12), P('Expected final comparison', 'H2X')]
comparison = [['Metric', 'Existing network', 'Proposed network', 'Interpretation'], ['Coverage', '72%', '91%', 'More demand served within the threshold'], ['Average distance', '38 km', '21 km', 'Shorter average delivery distance'], ['Delivery time', '57 min', '32 min', 'Faster expected service'], ['Underserved orders', '14', '3', 'Fewer orders outside the service range'], ['Estimated transport cost', 'Rs. 9,260', 'Rs. 6,800', 'Lower estimated network cost']]
story += [table(comparison, [43*mm, 35*mm, 35*mm, 57*mm], TEAL), PageBreak()]

story += [P('3. Industry problem and research grounding', 'H1X'), P('This project is motivated by a common large-retail supply-chain problem: demand is geographically uneven, inventory and fulfillment decisions change quickly, and warehouse capacity must be positioned close enough to customers without creating unnecessary network cost.', 'BodyX'), P('Walmart and the Sparkathon 2025 context', 'H2X'), P('Walmart Global Tech describes Sparkathon as a retail and technology solution showcase for students. The 2025 context included retail supply-chain transformation as a relevant innovation direction. This project responds to that direction with a focused warehouse-network recommendation layer connected to live WMS workflows.', 'BodyX'), P('The project does not use Walmart internal data or claim to reproduce Walmart systems. Walmart is used as an industry context and problem motivation; the evaluation uses the project database and explicitly generated research observations.', 'SmallX'), P('Why this is a relevant industry problem', 'H2X')]
problem_rows = [['Industry challenge', 'How this project responds'], ['Uneven geographic demand', 'Clusters customer order coordinates to reveal demand centres.'], ['Long or inconsistent service distance', 'Measures nearest-warehouse distance and service-threshold coverage.'], ['Stock and capacity imbalance', 'Includes warehouse utilization and category capacity in the recommendation logic.'], ['Fast operational change', 'Connects the analysis to orders, inventory deduction, alerts, and audit history.'], ['Need for explainable decisions', 'Shows baseline versus proposed metrics rather than an unexplained AI score.']]
story += [table(problem_rows, [58*mm, 112*mm], NAVY), Spacer(1, 12), P('Related research foundations', 'H2X'), P('The approach is consistent with established facility-location and supply-chain research: demand clustering can generate candidate areas; facility-location models commonly balance distance, coverage, capacity, and cost; and multi-objective location planning treats customer service and transportation cost as competing objectives.', 'BodyX')]
references = [['Reference', 'Relevance to this project'], ['Walmart Global Tech India, Sparkathon Terms and Conditions (2025). tech.walmart.com/content/converge/en_in/sparkathon/terms-conditions.html', 'Official context for Sparkathon as a student retail and technology solution showcase.'], ['Walmart, Walmart\'s U.S. Supply Chain Playbook Goes Global (2025). corporate.walmart.com/content/corporate/en_us/news/2025/07/17/walmarts-us-supply-chain-playbook-goes-global-and-its-reinventing-retail-at-scale.html', 'Industry context for predictive warehouse and transportation management and AI-enabled supply-chain orchestration.'], ['Chen et al. (2022), The Optimization of the Location of Front Distribution Centre, International Journal of Production Economics, 263, 108950. doi.org/10.1016/j.ijpe.2023.108950', 'Supports joint spatial demand clustering and facility-location optimization for customer time satisfaction and cost.'], ['Locating a facility to simultaneously address access and coverage goals, Journal of Regional Science. doi.org/10.1111/pirs.12693', 'Supports evaluating access and coverage together rather than optimizing only one distance measure.'], ['A large-scale heuristic approach to integrate on-demand warehousing into dynamic distribution network designs (2023). doi.org/10.1016/j.cie.2023.109752', 'Supports considering capacity and flexible warehouse-network design in large demand-location problems.']]
story += [table(references, [91*mm, 79*mm], TEAL), PageBreak()]

story += [P('4. Final system scope', 'H1X'), P('The teacher-facing application should remain focused. Each visible area must support either the research contribution or the operational proof.', 'BodyX')]
scope = [['Visible area', 'Why it remains'], ['Research Outcome', 'Primary research result and before-after evidence.'], ['Dashboard Overview', 'High-level view of the live warehouse state.'], ['Inventory and Orders', 'Demonstrates real stock and order synchronization.'], ['Operations Center', 'Shows fulfillment and operational status.'], ['Alerts and Reports', 'Shows monitoring, evidence, and communication of results.'], ['Audit Logs', 'Shows traceability for administrative review.']]
story += [table(scope, [52*mm, 118*mm], NAVY), Spacer(1, 13), P('Final project statement', 'H2X'), P('SupplyChain-AI is an AI-assisted warehouse network recommendation and decision-support system integrated with real warehouse operations. It uses historical demand and geospatial accessibility to identify suitable warehouse locations, quantifies the expected improvement, and connects the approved decision to inventory, order fulfillment, alerts, and audit workflows.', 'QuoteX'), P('The system recommends; the manager decides; the warehouse platform executes and records the outcome.', 'H2X')]

doc = SimpleDocTemplate(OUT, pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=18*mm, bottomMargin=20*mm, title='SupplyChain-AI Integrated Recommendation System', author='SupplyChain-AI Project')
doc.build(story, onFirstPage=hf, onLaterPages=hf)
print(OUT)

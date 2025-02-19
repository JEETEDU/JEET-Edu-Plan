import Link from "next/link";

function JEET() {
    return <span className="italic">{"<JEET>"}</span>
}

export default function Privacy() {
    return (
        <div className="space-y-8 flex flex-col">
            <div className="leading-7 text-lg">
                <Link href="https://jeetplan.xyz" className="text-blue-700 underline font-semibold">
                    JEET Edu Plan
                </Link>(이하 {'"JEET"'})
                은(는) 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </div>
            <div className="text-base">
                ○ 이 개인정보처리방침은 <span className="italic">2025</span>년 <span className="italic">2</span>월 <span className="italic">18</span>일 부터 적용됩니다.
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제1조 (개인정보의 처리 목적)
                </div>
                <ul className="pl-4">
                    <li className="space-y-2">
                        ① <JEET/> 은(는) 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                        <ul className="pl-4 list-circle list-inside space-y-2 font-bold">
                            <li>
                                <span>회원 가입 및 관리</span>
                                <div className="font-medium">
                                    회원 가입 의사 확인, 서비스 제공에 따른 본인 식별 및 인증, 회원자격 유지 및 관리, 서비스 부정이용 방지, 만 14세 미만 아동의 개인정보 처리 시 법정대리인의 동의 여부 확인, 각종 고지 및 통지, 문의사항 처리를 목적으로 개인정보를 처리합니다.
                                </div>
                            </li>
                            <li>
                                <span>서비스 제공</span>
                                <div className="font-medium">
                                    회원제 서비스 제공 및 서비스 유지보수를 목적으로 개인정보를 처리합니다.
                                </div>
                            </li>
                            <li>
                                <span>통계 및 마케팅</span>
                                <div className="font-medium">
                                    서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계를 목적으로 개인정보를 처리합니다.
                                </div>
                            </li>
                            <li>
                                <span>민원 처리</span>
                                <div className="font-medium">
                                    민원 처리를 목적으로 개인정보를 처리합니다.
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>

            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제2조 (개인정보의 처리 및 보유 기간)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        ① <JEET/> 은(는) 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                    </li>
                    <li className="space-y-2">
                        ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li>
                                1. 회원 가입 및 관리, 2. 서비스 제공, 3. 통계 및 마케팅, 4. 민원 처리
                            </li>
                            <li>
                                해당 목적과 관련한 개인정보의 보유기간은 제3조(처리하는 개인정보의 항목)에 명시된 바에 따릅니다.
                            </li>
                        </ul>
                    </li>
                </ul>

            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제3조 (처리하는 개인정보의 항목)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        ① <JEET/> 은(는) 다음의 개인정보 항목을 정보주체의 동의 없이 처리하고 있습니다.
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li className="font-bold">
                                성명, 생년, 학교, 학년
                            </li>
                            <li>
                                필수항목 : 성명, 생년, 학교, 학년
                            </li>
                            <li>
                                수집 목적 : 1. 회원 가입 및 관리, 2. 서비스 제공, 3. 통계 및 마케팅, 4. 민원 처리
                            </li>
                            <li>
                                법적 근거: 개인정보 보호법 제15조 제1항 제4호
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제4조 (만 14세 미만 아동의 개인정보 처리에 관한 사항)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        ① <JEET/> 은(는) 만 14세 미만 아동에 대해 개인정보를 수집할 때 법정대리인의 동의를 얻어 해당 서비스 수행에 필요한 최소한의 개인정보를 수집합니다.
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li>
                                필수항목 : 법정 대리인의 성명, 관계, 연락처
                            </li>
                        </ul>
                    </li>
                    <li className="space-y-2">
                        ② 또한, <JEET/> 의 관련 홍보를 위해 아동의 개인정보를 수집할 경우에는 법정대리인으로부터 별도의 동의를 얻습니다.
                    </li>
                    <li className="space-y-2">
                        ③ <JEET/> 은(는) 만 14세 미만 아동의 개인정보를 수집할 때에는 아동에게 법정대리인의 성명, 연락처와 같이 최소한의 정보를 요구할 수 있으며, 다음 중 하나의 방법으로 적법한 법정대리인이 동의하였는지를 확인합니다.
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li>
                                동의 내용을 게재한 인터넷 사이트의 관리주체에게 법정대리인이 동의 여부를 대면으로 구두 등을 통하여 표시하도록 하는 방법
                            </li>
                            <li>
                                동의 내용을 게재한 인터넷 사이트에 법정대리인이 동의 여부를 표시하도록 하고 개인정보처리자가 그 동의 표시를 확인했음을 법정대리인의 휴대전화 문자 메시지로 알리는 방법
                            </li>
                            <li>
                                동의 내용이 적힌 서면을 법정대리인에게 직접 발급하거나, 우편 또는 팩스를 통하여 전달하고 법정대리인이 동의 내용에 대하여 서명날인 후 제출하도록 하는 방법
                            </li>
                            <li>
                                동의 내용이 적힌 전자우편을 발송하여 법정대리인으로부터 동의의 의사표시가 적힌 전자우편을 전송받는 방법
                            </li>
                            <li>
                                전화를 통하여 동의 내용을 법정대리인에게 알리고 동의를 얻거나 인터넷주소 등 동의 내용을 확인할 수 있는 방법을 안내하고 재차 전화 통화를 통하여 동의를 얻는 방법
                            </li>
                            <li>
                                그 밖에 위와 준하는 방법으로 법정대리인에게 동의 내용을 알리고 동의의 의사표시를 확인하는 방법
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제5조 (개인정보의 파기절차 및 파기방법)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        ① <JEET/> 은(는) 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                    </li>
                    <li className="space-y-2">
                        <span>② 개인정보 파기의 절차 및 방법은 다음과 같습니다.</span>
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li>
                                <span className="font-bold">파기절차</span>
                                <div>
                                    <JEET/> 은(는) 파기 사유가 발생한 개인정보를 선정하고, <JEET/> 의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
                                </div>
                            </li>
                            <li>
                                <span className="font-bold">파기방법</span>
                                <div>
                                    데이터베이스에서 해당 내역을 삭제합니다.
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제6조 (정보주체와 법정대리인의 권리·의무 및 그 행사방법에 관한 사항)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        ① 정보주체는 JEET에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
                    </li>
                    <li>
                        ② 제1항에 따른 권리 행사는 <JEET/> 에 대해 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 <JEET/> 은(는) 이에 대해 지체 없이 조치하겠습니다.
                    </li>
                    <li>
                        ③ 제1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다.이 경우 “개인정보 처리 방법에 관한 고시(제2020-7호)” 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
                    </li>
                    <li>
                        ④ 개인정보 열람 및 처리정지 요구는 「개인정보 보호법」 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수 있습니다.
                    </li>
                    <li>
                        ⑤ 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.
                    </li>
                    <li>
                        ⑥ <JEET/> 은(는) 정보주체 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를 확인합니다.
                    </li>
                </ul>
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제7조 (개인정보의 안전성 확보조치에 관한 사항)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        <span>① <JEET/> 은(는) 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</span>
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li>
                                <span className="font-bold">개인정보 취급 직원의 최소화 및 교육</span>
                                <div>
                                    개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화 하여 개인정보를 관리하는 대책을 시행하고 있습니다.
                                </div>
                            </li>
                            <li>
                                <span className="font-bold">개인정보에 대한 접근 제한</span>
                                <div>
                                    개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여,변경,말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있으며 외부로부터의 무단 접근을 통제하고 있습니다.
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제8조 (개인정보 보호책임자에 관한 사항)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        ① <JEET/> 은(는) 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                    </li>
                    <li className="space-y-2">
                        ② 정보주체께서는 <JEET/> 의 서비스(또는 사업)을 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. <JEET/> 은(는) 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li>
                                <span className="font-bold">개인정보 보호책임자</span>
                                <div>
                                    성명: 안성민
                                </div>
                                <div>
                                    연락처: dev@hegelty.me
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제9조 (정보주체의 권익침해에 대한 구제방법)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        <span>① 정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다. 이 밖에 기타 개인정보침해의 신고, 상담에 대하여는 아래의 기관에 문의하시기 바랍니다.</span>
                        <ul className="pl-4 list-circle list-inside space-y-2">
                            <li>
                                개인정보분쟁조정위원회 : (국번없이) 1833 - 6972(www.kopico.go.kr)
                            </li>
                            <li>
                                개인정보침해신고센터 : (국번없이) 118(privacy.kisa.or.kr)
                            </li>
                            <li>
                                대검찰청 : (국번없이) 1301(www.spo.go.kr)
                            </li>
                            <li>
                                경찰청 : (국번없이) 182(ecrm.cyber.go.kr)
                            </li>
                        </ul>
                        <div>
                            「개인정보보호법」제35조(개인정보의 열람 ), 제36조(개인정보의 정정·삭제 ), 제37조(개인정보의 처리정지 등 ) 의 규정에 의한 요구에 대 하여 공공기관의 장이 행한 처분 또는 부작위로 인하여 권리 또는 이익의 침해를 받은 자는 행정심판법이 정하는 바에 따라 행정심판을 청구할 수 있습니다.
                        </div>
                        <div>
                            ※ 행정심판에 대해 자세한 사항은 중앙행정심판위원회(www.simpan.go.kr) 홈페이지를 참고하시기 바랍니다.
                        </div>
                    </li>
                </ul>
            </div>
            <div className="space-y-4 flex flex-col">
                <div className="text-xl font-bold">
                    제10조 (개인정보 처리방침 변경)
                </div>
                <ul className="pl-4 space-y-2">
                    <li className="space-y-2">
                        <span>① 이 개인정보처리방침은 2025년 2월 18일부터 적용됩니다.</span>
                    </li>
                    <li className="space-y-2">
                        <span>② 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}
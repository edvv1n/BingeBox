import { Ticket, Popcorn } from "lucide-react";
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";
import MemberForm from "@/components/MemberForm";
export default function Signup() {
  const [bank, setBank] = useState<any>(null);
  return (
    <section className="form-page">
      <div className="form-intro">
        <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
        <h1>
          Good stories.
          <br />
          <em>Great company.</em>
        </h1>
        <p>Join BingeBox and make more time for the stories you love.</p>
        <div className="signup-steps">
          <p>
            <span>1</span> Tell us a little about yourself
          </p>
          <p>
            <span>2</span> Complete your subscription payment
          </p>
          <p>
            <span>3</span> Get your credentials. Get comfy.
          </p>
        </div>
        <blockquote>
          <Popcorn className="quote-icon" size={25} aria-hidden="true" />
          All you need now is the popcorn.
          <span>We’ll help with the next step.</span>
        </blockquote>
      </div>
      <div className="form-card">
        <p className="eyebrow icon-eyebrow ticket-heading">
          <Ticket size={22} aria-hidden="true" />
          WELCOME TO BINGEBOX
        </p>
        <h2>Save your seat.</h2>
        <p>Enter your details to get started.</p>
        <MemberForm kind="signup" onSuccess={(d) => setBank(d.bank)} />
        <p className="form-note">
          Your login credentials will be emailed to you when your subscription
          is confirmed.
        </p>
      </div>
      {bank && <PaymentModal bank={bank} onClose={() => setBank(null)} />}
    </section>
  );
}

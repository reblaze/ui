<template>
  <div class="card-content">
    <div class="card mb-5 contact-support-card">
      <div class="card-content">
        <h4 class="title">
          Contact Your Support Team
        </h4>
        <p>
          For standard support issues, please send mail to:
          <a href="mailto:support@reblaze.com"
             class="email">
            support@reblaze.com
          </a>
        </p>
        <p>
          For urgent matters, please call:
        </p>
        <div class="phone-numbers">
          <div class="phone-number">
            <a href="tel:+18886155996"
               class="phone">
              + 1 (888) 6155996
            </a> (US Toll Free)
          </div>
          <div class="phone-number">
            <a href="tel:+972732005230"
               class="phone">
              + 972 (73) 2005230
            </a> (Reblaze HQ)
          </div>
          <div class="phone-number">
            <a href="tel:+448081751950"
               class="phone">
              + 44 (808) 1751950
            </a> (UK Toll Free)
          </div>
        </div>
      </div>
    </div>
    <div class="card manager-escalation-card">
      <div class="card-content">
        <h4 class="title">
          Manager Escalation
        </h4>
        <p>
          For management escalation please send email to:
          <a href="mailto:manager.escalation@reblaze.com"
             class="email">
            manager.escalation@reblaze.com
          </a>
          <br/>
          Please allow up to 48 business hours for a reply.
          For urgent matters please call the support number above.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'HelpAndSupport',
})
</script>

<style scoped
       lang="scss">

.phone,
.email {
  background: 0 0;
  color: #428bca;
  cursor: pointer;
  text-decoration: none;
}


.title {
  background: transparent;
  color: #000;
  font-size: 16px;
  margin-bottom: 20px;
  margin-top: 0;
}


</style>

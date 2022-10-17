<template >
  <section>
  <div class="section">
    <div class="container-fluid">
      <div class="container-fluid">
          <div class="row title-heading">
            <div class="col-md-12">
              <p class="page-title">Help and Support</p>
            </div>
          </div>
        </div>
      <div class="row content">
        <div class="col-md-12">
          <div class="panel panel-default leading">
            <div class="panel-heading">
              <h4 class="panel-title">User Manual</h4>
            </div>
            <div class="panel-body">
              <a href="https://gb.docs.reblaze.com/v/v2.20.1/" target="_blank">User Manual (external)</a>
            </div>
          </div>
          <div class="panel panel-default leading">
            <div class="panel-heading">
              <h4 class="panel-title">Access Log Structure</h4>
            </div>
            <div class="panel-body">
              <a target="_blank" href="https://docs.google.com/document/d/107n75EVxcbwI87E2CaLL-UPu6IlpPlD2wJ-8fjCBpKI/edit?usp=sharing">Log file structure / description.</a>
            </div>
          </div>
          <div class="panel panel-default leading">
            <div class="panel-heading">
              <h4 class="panel-title title">Contact Your Support Team</h4>
            </div>
            <div class="panel-body">
              <p>For standard support issues, please send mail to:
                <a href="mailto:support@reblaze.com">support@reblaze.com</a></p>
              <p>For urgent matters, please call:</p>
              <address>
                <phone><a href="tel:+18886155996">+ 1 (888) 6155996</a> (US Toll Free)</phone><br/>
                <phone><a href="tel:+972732005230">+ 972 (73) 2005230</a> (Reblaze HQ)</phone><br/>
                <phone><a href="tel:+448081751950">+ 44 (808) 1751950</a> (UK Toll Free)</phone>
              </address>
            </div>
          </div>
          <div class="panel panel-default leading">
            <div class="panel-heading">
              <h4 class="panel-title">Manager Escalation</h4>
            </div>
            <div class="panel-body">
              <p>For management escalation please send email to:
                <a href="mailto:manager.escalation@reblaze.com">
                  manager.escalation@reblaze.com
                </a>
                <br />
                Please allow up to 48 business hours for a reply.
                For urgent matters please call the support number above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </section>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'HelpAndSupport',
})
</script>

<style scoped lang="scss">

a {
  background: 0 0;
  color: #428bca;
  cursor: pointer;
  font-family: 'Roboto Condensed', sans-serif;
  text-decoration: none;
}


h1,
h2,
h3,
h4,
p {
  font-family: 'Roboto Condensed', sans-serif;
}

.title-heading {
  background: transparent;
}

.page-title {
  background: transparent;
  color: #000;
  font-size: 18px;
}

.panel-title {
  color: inherit;
  font-size: 16px;
  margin-bottom: 0;
  margin-top: 0;
}

.leading {
  margin-top: 40px;
}

.panel {
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgb(0 0 0 / 5%);
  margin-bottom: 20px;
}

.panel-heading {
  background-color: #f5f5f5;
  border-bottom: 1px solid transparent;
  border-color: #ddd;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  color: #333;
  padding: 10px 15px;
}

.panel-default.leading .panel-heading {
  padding-right: 0;
}

.panel-body {
  font-size: 14px;
  padding: 15px;
}

.section {
  background: #eff2f3;
}

</style>
